# Addis Eats

A modern, responsive food ordering web application built with semantic HTML, CSS, and vanilla JavaScript. Addis Eats provides a realistic restaurant ordering experience for customers and a practical management system for administrators.

## Project Overview

Addis Eats provides two connected experiences:

- **Customer Application:** Browse dishes, search and filter the menu, manage a persistent cart, save favorites, place orders, view order history, reorder meals, and track active deliveries.
- **Admin Dashboard:** Manage dishes, control menu availability, manage customer orders, update delivery status, and view business statistics.

The project remains beginner-friendly while demonstrating real-world front-end concepts such as state management, browser storage, form validation, responsive design, reusable rendering, and customer/admin workflows.


## Customer Features

| # | Feature | Description |

| 1 | Browse Menu | Loads and displays dishes from the menu data source. |
| 2 | Live Search | Filters dishes instantly as the customer types. |
| 3 | Category Filter | Filters by Ethiopian, Pizza, Burgers, and Drinks. |
| 4 | Add to Cart | Adds available dishes to the shopping cart. |
| 5 | Update Quantity | Increases or decreases quantities with `+` and `−` controls. |
| 6 | Remove from Cart | Removes individual cart items. |
| 7 | Live ETB Total | Recalculates subtotal, delivery fee, and total instantly. |
| 8 | Cart Persistence | Keeps the cart after refresh using `localStorage`. |
| 9 | Checkout Form | Collects name, phone, delivery area, and special instructions. |
| 10 | Form Validation | Validates customer information before submission. |
| 11 | Order Confirmation | Shows confirmation after a successful order. |
| 12 | Loading States | Shows a loading indicator while menu data is fetched. |
| 13 | Empty States | Provides friendly messages for empty menu, cart, favorites, and history. |
| 14 | Error Handling | Handles failed data loading gracefully. |
| 15 | Responsive Design | Works on mobile, tablet, and desktop. |
| 16 | Order History | Lets customers view previous orders. |
| 17 | Favorites / Wishlist | Saves favorite dishes and provides a header favorites button with a live count. |
| 18 | Dish Details | Shows description and ingredients for a dish. |
| 19 | Reorder | Adds items from a previous order back to the cart. |
| 20 | Delivery Fee Calculator | Calculates delivery charges based on delivery area. |
| 21 | Estimated Delivery | Displays an estimated delivery time. |
| 22 | Dark / Light Theme | Switches and persists the selected theme. |
| 23 | Special Instructions | Allows a note to be added to an order. |
| 24 | Cart Badge | Shows the current number of cart items. |
| 25 | Keyboard Accessibility | Uses semantic, keyboard-friendly controls and forms. |
| 26 | ETB Currency | Formats prices consistently in Ethiopian Birr. |
| 27 | Live Order Tracking | Tracks an order from receipt through delivery. |
| 28 | Recommendations | Suggests dishes based on cart and favorite activity. |
| 29 | Surprise Me | Helps customers discover a random available dish. |
| 30 | Delivery Status | Provides visual progress for active orders. |


## Admin Features

### Dashboard

- Revenue summary
- Total order count
- Average order value
- Available dish count
- Hidden dish count
- Top-selling dishes
- Order status overview
- Recent orders

### Menu Management

Administrators can:

- Add dishes
- Edit dishes
- Delete dishes
- Search dishes
- Change prices
- Change categories
- Update descriptions
- Update image paths
- Update ingredients
- Enable dishes
- Disable dishes

### Enable / Disable Dish System

Dish availability is controlled directly from the admin dashboard.

```text
Admin Dashboard
      ↓
Enable / Disable dish
      ↓
Availability saved
      ↓
Customer menu updates
```

When a dish is disabled, it is removed from the customer-facing menu. When enabled again, it becomes available.

### Order Management

Administrators can:

- View customer orders
- View customer and delivery information
- View totals
- Change order status
- Delete orders

Supported states:

```text
Pending
   ↓
Preparing
   ↓
Delivering
   ↓
Delivered
```

These states are also used by the customer order-tracking experience.


## Customer Order Flow

```text
Browse Menu
     ↓
Search / Filter
     ↓
View Dish Details
     ↓
Add to Cart
     ↓
Adjust Quantity
     ↓
Select Delivery Area
     ↓
Review ETB Total
     ↓
Checkout
     ↓
Order Confirmation
     ↓
Live Order Tracking
     ↓
Preparing
     ↓
Delivering
     ↓
Delivered
```


## Live Order Tracking

After checkout, customers can track an order using its unique order ID.

The tracking experience displays:

- Order number
- Customer information
- Delivery area
- Order total
- Current status
- Estimated delivery time
- Visual progress
- Status-specific messages

Example:

```text
✓ Order Received
      ↓
✓ Preparing
      ↓
● On the Way
      ↓
○ Delivered
```

Active orders can also be accessed from Order History.

---

## Data Persistence

Addis Eats uses browser storage.

### `localStorage`

Used for persistent application data such as:

- Cart
- Favorites
- Orders
- Menu availability
- Theme preference

### `sessionStorage`

Used for the administrator login session.

> This is a front-end demonstration. Browser storage is not a production database or secure authentication system.


## Project Structure

```text
addis-eats/
│
├── index.html
├── admin-login.html
├── admin-dashboard.html
│
├── styles.css
├── admin.css
│
├── app.js
├── admin-login.js
├── admin.js
│
├── data/
│   └── menu.json
│
├── images/
│   └── food and hero images
│
└── README.md
```

### Main Files

**`index.html`**  
Customer-facing application containing the header, search, favorites, cart, hero, menu, filters, dialogs, checkout, order history, tracking, and footer.

**`app.js`**  
Controls menu loading, search, filters, cart, favorites, recommendations, dish details, checkout, validation, orders, reorder, delivery calculation, themes, and tracking.

**`admin-dashboard.html`**  
Administrator interface for restaurant management.

**`admin.js`**  
Controls dashboard statistics, menu CRUD, enable/disable functionality, order management, and status updates.

**`admin-login.html` / `admin-login.js`**  
Provide the demonstration administrator login flow and session handling.

**`styles.css`**  
Main customer-facing design system, including responsive layout, menu cards, cart, dialogs, forms, hero, and theme styles.

**`admin.css`**  
Styles specifically for the admin dashboard.

**`data/menu.json`**  
Initial menu dataset.

Example:

```json
{
  "id": 1,
  "name": "Doro Wat",
  "description": "Spicy Ethiopian chicken stew",
  "price": 350,
  "category": "ethiopian",
  "image": "images/doro-wat.jpg",
  "ingredients": [
    "Chicken",
    "Berbere",
    "Onions"
  ]
}
```


## Running the Project

Because the application loads `data/menu.json`, use a local development server.

### VS Code Live Server

1. Open the project in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Python

From the project folder:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

---

## Demo Admin Login

```text
Username: admin
Password: admin123
```

This is only a demonstration login and should not be used for production authentication.


## Responsive Design

### Mobile

- Single-column menu
- Compact navigation
- Touch-friendly controls
- Responsive cart
- Responsive dialogs and forms

### Tablet

- Two-column menu
- Flexible cart
- Adaptive dashboard cards

### Desktop

- Multi-column menu grid
- Right-side cart
- Full admin dashboard
- Expanded navigation and analytics


## Accessibility

The project uses:

- Semantic HTML
- Form labels
- Keyboard-accessible controls
- Meaningful button text
- ARIA labels where appropriate
- Dialog elements
- Focusable interactive controls
- Responsive controls
- Clear visual states


## Error and Empty States

Examples include:

```text
Loading menu...
```

```text
No dishes found.
Try another search or category.
```

```text
Your cart is empty.
Add something delicious from the menu.
```

```text
No orders yet.
```

Failed menu loading is handled gracefully with fallback behavior where available.

## Design Direction

The Addis Eats visual identity is:

- Modern
- Minimal
- Premium
- Black-first
- High contrast
- Clean
- Responsive

A bright accent color is used for important actions while the main interface remains dark and refined.

## Technology Stack

```text
HTML5
CSS3
Vanilla JavaScript
JSON
localStorage
sessionStorage
Responsive Web Design
```

No front-end framework is required.

The project intentionally uses standard web technologies so the implementation remains understandable to beginner developers.


## Important Data Note

This project is a front-end demonstration.

Customer orders, favorites, cart data, menu availability, and other state are stored locally in the browser.

Therefore:

- Data is specific to the browser/device.
- It is not shared between devices.
- Clearing browser storage removes local application data.
- Admin changes are not connected to a real server database.

For production, the next step would be connecting the application to a real backend and database.


## Recommended Production Upgrades

1. Real backend API
2. Database for dishes and orders
3. Secure administrator authentication
4. Customer accounts
5. Real-time order updates using WebSockets
6. Payment integration
7. Rider and delivery management
8. Customer notifications
9. Cloud image storage
10. Restaurant analytics
11. Role-based admin permissions
12. Order cancellation and refund workflow


## Project Goal

Addis Eats demonstrates how a modern food-ordering platform can be built using beginner-friendly web technologies while still providing realistic customer and restaurant workflows.

```text
Modern UI
+
Semantic HTML
+
Responsive CSS
+
JavaScript State Management
+
Browser Persistence
+
Customer Ordering
+
Order Tracking
+
Admin Management
```

**Addis Eats — Great food. Right to you.**
