import { describe, expect, it } from "vitest";
import { orderRouter } from "../../api/orderRouter";
import { BUSINESS_OWNER_EMAIL } from "@contracts/roles";
import { findUserByEmail } from "../../api/queries/users";

describe("Info Order Creation -> Admin Orders Flow", () => {
  it("creates order from /info and makes it immediately appear in Admin /orders with ticket, items, total, payment method, and time", async () => {
    const ownerUser = await findUserByEmail(BUSINESS_OWNER_EMAIL);
    expect(ownerUser).toBeDefined();

    const publicCaller = orderRouter.createCaller({
      req: new Request("http://localhost:3000/api/trpc"),
      resHeaders: new Headers(),
    } as any);

    const adminCaller = orderRouter.createCaller({
      user: ownerUser!,
      req: new Request("http://localhost:3000/api/trpc"),
      resHeaders: new Headers(),
    } as any);

    // 1. Customer on /info submits with phone and 2 items
    const customerPhone = "+1 912-196-9239";
    const order1 = await publicCaller.create({
      shippingMobileNumber: customerPhone,
      shippingState: "New York",
      paymentMethod: "cod",
      items: [
        { productId: 61, quantity: 2 }, // French Fries ($3.49 * 2 = $6.98)
        { productId: 65, quantity: 1 }, // Mac N' Cheese ($4.99 * 1 = $4.99)
      ],
    });

    expect(order1).toBeDefined();
    expect(order1.orderId).toBeGreaterThan(0);
    expect(order1.orderNumber).toMatch(/^T-9239-/);

    // 2. A second customer submits a distinct order
    const secondPhone = "+1 917-555-5743";
    const order2 = await publicCaller.create({
      shippingMobileNumber: secondPhone,
      shippingState: "New York",
      paymentMethod: "cod",
      items: [
        { productId: 61, quantity: 1 },
      ],
    });

    expect(order2).toBeDefined();
    expect(order2.orderId).toBeGreaterThan(0);
    expect(order2.orderNumber).toMatch(/^T-5743-/);
    expect(order2.orderId).not.toBe(order1.orderId);

    // 3. Admin queries /orders (supplier list)
    const adminOrders = await adminCaller.list({
      type: "supplier",
      size: 20,
    });

    expect(adminOrders.items.length).toBeGreaterThanOrEqual(2);

    // Verify order 1 is listed for admin
    const foundOrder1 = adminOrders.items.find((o) => o.id === order1.orderId);
    expect(foundOrder1).toBeDefined();
    expect(foundOrder1?.ticketNumber).toBe("T 9239");
    expect(foundOrder1?.paymentMethod).toBe("cod");
    expect(Number(foundOrder1?.totalAmount)).toBeGreaterThan(0);
    expect(foundOrder1?.orderedAt).toBeDefined();

    // Verify items, quantities, and prices are visible
    expect(foundOrder1?.items).toBeDefined();
    expect(foundOrder1?.items?.length).toBe(2);
    const friesItem = foundOrder1?.items?.find((i) => i.productName.includes("French Fries"));
    expect(friesItem).toBeDefined();
    expect(friesItem?.quantity).toBe(2);
    expect(Number(friesItem?.unitPrice)).toBe(3.25);

    const macItem = foundOrder1?.items?.find((i) => i.productName.includes("Mac"));
    expect(macItem).toBeDefined();
    expect(macItem?.quantity).toBe(1);
    expect(Number(macItem?.unitPrice)).toBeGreaterThan(0);

    // Verify order 2 is also listed as a separate order
    const foundOrder2 = adminOrders.items.find((o) => o.id === order2.orderId);
    expect(foundOrder2).toBeDefined();
    expect(foundOrder2?.ticketNumber).toBe("T 5743");
    expect(foundOrder2?.id).not.toBe(foundOrder1?.id);
  }, 30000);
});
