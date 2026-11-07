import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// jsdom does not implement these browser APIs; the app calls them on navigation.
beforeAll(() => {
  window.scrollTo = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const cardOf = (seller) => screen.getByRole("heading", { name: seller }).closest("article");
const tripCount = () => screen.getAllByRole("article").length;

describe("listings display", () => {
  test("shows the four seed listings with their seller, capacity and route", () => {
    render(<App />);

    expect(tripCount()).toBe(4);
    expect(screen.getByText("4 trips")).toBeInTheDocument();

    const amara = within(cardOf("Amara K."));
    expect(amara.getByText("8 kg available")).toBeInTheDocument();
    expect(amara.getByText(/Cameroon → Russia/)).toBeInTheDocument();
    expect(amara.getByText("Verified")).toBeInTheDocument();
  });

  test("marks unverified sellers as such", () => {
    render(<App />);

    expect(screen.getAllByText("Verified")).toHaveLength(3);
    expect(within(cardOf("Fatou N.")).queryByText("Verified")).not.toBeInTheDocument();
  });
});

describe("route, date and capacity filters", () => {
  test("filters listings by route", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("ROUTE"), "rus-cmr");

    expect(tripCount()).toBe(2);
    expect(screen.getByText("2 trips")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nikolai V." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ivan M." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Amara K." })).not.toBeInTheDocument();
  });

  test("filters listings by minimum capacity", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("MIN CAPACITY"), "10");

    expect(tripCount()).toBe(2);
    expect(screen.queryByRole("heading", { name: "Fatou N." })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Amara K." })).not.toBeInTheDocument();
  });

  test("filters listings by departure date", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("FROM DATE"), { target: { value: "2025-07-01" } });

    expect(tripCount()).toBe(2);
    expect(screen.getByRole("heading", { name: "Fatou N." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ivan M." })).toBeInTheDocument();
  });

  test("shows an empty state when nothing matches and Reset restores every listing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("ROUTE"), "cmr-rus");
    await user.type(screen.getByLabelText("MIN CAPACITY"), "10");

    expect(screen.getByText(/No trips match these filters/)).toBeInTheDocument();
    expect(screen.getByText("0 trips")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(tripCount()).toBe(4);
    expect(screen.getByText("4 trips")).toBeInTheDocument();
  });
});

describe("booking and contact", () => {
  test("total follows the number of kilos and is capped at the kilos available", async () => {
    const user = userEvent.setup();
    render(<App />);

    const fatou = within(cardOf("Fatou N."));
    const plus = fatou.getByRole("button", { name: "+" });

    await user.click(plus);
    expect(fatou.getByText("$28")).toBeInTheDocument();

    for (let i = 0; i < 10; i += 1) {
      await user.click(plus);
    }
    // Fatou has 5 kg at $14/kg: the stepper must stop at 5 kg.
    expect(fatou.getByText("$70")).toBeInTheDocument();
  });

  test("the contact modal is prefilled and confirms the request", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(cardOf("Amara K.")).getByRole("button", { name: /contact/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Contact Amara K.")).toBeInTheDocument();
    expect(within(dialog).getByRole("textbox").value).toContain("Hi Amara");

    await user.click(within(dialog).getByRole("button", { name: /send request/i }));
    expect(within(dialog).getByText("Request sent")).toBeInTheDocument();
  });
});

describe("listing form validation", () => {
  const openForm = async (user) => {
    await user.click(screen.getAllByRole("button", { name: /get started/i })[0]);
    expect(screen.getByRole("heading", { name: "List your kilos" })).toBeInTheDocument();
  };

  const fillValidForm = async (user, overrides = {}) => {
    const values = { name: "Test Seller", kg: "12", price: "11", flight: "AF 700", ...overrides };
    await user.type(screen.getByLabelText("YOUR NAME *"), values.name);
    await user.selectOptions(screen.getByLabelText("FROM CITY *"), "Douala");
    await user.selectOptions(screen.getByLabelText("TO CITY *"), "Moscow");
    fireEvent.change(screen.getByLabelText("TRAVEL DATE *"), { target: { value: "2026-03-10" } });
    await user.type(screen.getByLabelText("KILOS AVAILABLE *"), values.kg);
    await user.type(screen.getByLabelText("PRICE PER KG (USD) *"), values.price);
    await user.type(screen.getByLabelText("FLIGHT NUMBER"), values.flight);
  };

  test("rejects an empty form and publishes nothing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openForm(user);

    await user.click(screen.getByRole("button", { name: /publish listing/i }));

    expect(window.alert).toHaveBeenCalledWith("Please fill all required fields with valid values.");
    expect(screen.getByRole("heading", { name: "List your kilos" })).toBeInTheDocument();
  });

  test("rejects a kilo amount above the limit", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openForm(user);

    await fillValidForm(user, { kg: "500" });
    await user.click(screen.getByRole("button", { name: /publish listing/i }));

    expect(window.alert).toHaveBeenCalledWith("Please fill all required fields with valid values.");
    expect(screen.getByRole("heading", { name: "List your kilos" })).toBeInTheDocument();
  });

  test("offers the cities of the selected route", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openForm(user);

    const from = screen.getByLabelText("FROM CITY *");
    expect(within(from).getByRole("option", { name: "Douala" })).toBeInTheDocument();
    expect(within(from).queryByRole("option", { name: "Moscow" })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("ROUTE *"), "rus-cmr");

    expect(within(from).getByRole("option", { name: "Moscow" })).toBeInTheDocument();
    expect(within(from).queryByRole("option", { name: "Douala" })).not.toBeInTheDocument();
  });

  test("publishes a valid listing at the top of the list, unverified", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openForm(user);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /publish listing/i }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(tripCount()).toBe(5);
    expect(screen.getByText("5 trips")).toBeInTheDocument();

    const newest = screen.getAllByRole("article")[0];
    expect(within(newest).getByRole("heading", { name: "Test Seller" })).toBeInTheDocument();
    expect(within(newest).getByText("12 kg available")).toBeInTheDocument();
    expect(within(newest).queryByText("Verified")).not.toBeInTheDocument();
  });
});

describe("theme", () => {
  test("toggling the theme updates the document and is remembered", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    await user.click(screen.getByRole("button", { name: /toggle light or dark theme/i }));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("kiloshare-theme")).toBe("light");
  });
});