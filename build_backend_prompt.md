## Complete Backend Prompt for a Furniture-Selling Website (Full Requirements)

You are an expert **TypeScript backend engineer**. I want you to build me a **complete backend** for a furniture-selling website. This backend must also include functionality for users to **upload images** of furniture so that we can:

1. **Estimate how much it would cost to build a new piece** of furniture (based on user-uploaded pictures or specifications).
2. **Estimate how much it would cost to fix old/damaged furniture** (again, based on user-uploaded pictures).

These estimates will be facilitated by using:
- **Vision model from Groq** (for analyzing images).
- **AI agents from LangGraph**, for which I will provide ample AI agent code in a separate folder.

Below are the **detailed requirements**:

---

### 1. **Tech Stack & Framework**

- **Node.js** & **TypeScript**.
- One of the following frameworks (pick the most suitable):
  - **NestJS** (preferred for enterprise-grade structure).
  - **Express.js** (if you prefer a more minimal approach).

---

### 2. **Database**

- You may use any of the following options:
  - **PostgreSQL** with Prisma or TypeORM.
  - **MongoDB** with Mongoose.
- Ensure you include:
  - **Migrations** (for SQL-based) or seed scripts (for sample data).
  - **Seed data** for testing (sample furniture products, a sample admin user, etc.).

> **Note**: The final code must make it clear how to configure and run migrations or seeds.

---

### 3. **Architecture**

- Strictly use **TypeScript**.
- Maintain a **modular** or **layered** approach:
  - If using **NestJS**, create modules for each domain (e.g., `Auth`, `Users`, `Products`, `Cart`, `Orders`, `Estimation`, etc.).
  - If using **Express**, split controllers, services, and routes in separate folders or files.

**Key Modules/Services**:
1. **Auth** – for user registration, login, logout, role-based access (e.g., admin vs user).
2. **Users** – user profiles, roles, password management, etc.
3. **Products** – admin can list/CRUD furniture items, users can view and purchase them.
4. **Cart** – for standard e-commerce cart functionality.
5. **Orders** – order management (create from cart, track status, handle payments).
6. **Estimation** (AI-driven) – user uploads an image to get an AI-based cost estimate (build or repair).
7. **Admin** – aggregated endpoints (or extended from above modules) to manage orders, products, categories, view/approve estimates, etc.

---

### 4. **Models & Entities**

At minimum, create data models for:

1. **User**
   - Fields: `id`, `email`, `passwordHash`, `role` (e.g., `user`, `admin`), timestamps.
   - Roles: 
     - **admin** – can manage products, orders, categories, view/approve AI estimates, etc.
     - **user** – can browse products, manage their cart, submit orders, request estimates, etc.

2. **Product**
   - Fields: `id`, `name`, `description`, `price`, `images[]`, `category`, `stockQuantity`, timestamps, etc.
   - Admin can create/update/delete products. Users can only view/list them.

3. **Cart** (or Cart Items)
   - Associates with a single user.
   - Contains line items referencing products plus `quantity`.
   - Possibly store `price` at the time the item was added, to handle price changes.

4. **Order**
   - Associates with a user.
   - Contains references to products, quantity, total price, shipping info, etc.
   - Tracks status: `pending`, `paid`, `shipped`, `delivered`, etc.

5. **Estimation** (for build/repair requests)
   - Links to the user who made the request.
   - Stores **image** references/URLs, **requested type** (`build` vs `repair`), **AI-provided estimate** (numeric), **status** (`pending`, `reviewed`, `approved`, `rejected`), timestamps, etc.

6. **Payment** (optional separate table/collection)
   - If integrating with Stripe or PayPal.
   - Stores references to the order, payment method, transaction status, etc.

> **Add any additional fields** you deem necessary (e.g., address fields, shipping details, discount codes, etc.).

---

### 5. **AI Integration (Groq Vision & LangGraph Agents)**

1. **Image Upload Flow**:
   - A user uploads one or more pictures of furniture they want built or repaired.
   - Store images either in:
     - Cloud storage (e.g., AWS S3, Cloudinary) or
     - Local server storage (for development).
   - After successful upload, the backend triggers:
     - **Groq Vision Model** to analyze the image for style, dimensions, materials, etc.
     - **LangGraph AI agents** (code from the provided folder) to interpret data and generate cost estimates.

2. **Estimation Endpoints**:
   - **POST** `/estimation/new`
     - Request body: user authentication token, image(s), optional text descriptions.
     - Action:
       1. Save the image references in DB/storage.
       2. Call the Groq Vision Model + LangGraph AI agent with the image/data.
       3. Receive an **estimated cost** from the AI.
       4. Store the estimate in the `Estimation` model (and return it to the user).

3. **Review/Approval**:
   - An admin can review or override the AI-provided estimate (optional).
   - The user can see the final estimate and decide to proceed or not.

---

### 6. **Endpoints & Features**

#### Auth & User Management

1. **POST** `/auth/register`
   - Create a new user account (default role: `user`).
   - Validate email/password.

2. **POST** `/auth/login`
   - Returns a JWT (or session token).

3. **POST** `/auth/logout`
   - Invalidates the current session/JWT (if you implement blacklisting or session store).

4. **GET** `/users/me`
   - Returns current user profile, requiring authentication.

5. **PATCH** `/users/:id`
   - Admin can edit user roles, or user can edit their own profile.

#### Product Management

1. **GET** `/products`
   - Public listing for all products.
   - Support filtering (e.g., by category) or pagination if desired.

2. **GET** `/products/:id`
   - Public product details.

3. **POST** `/products`
   - **Admin-only** – create new product.
   - Request body includes `name`, `description`, `price`, images, etc.

4. **PATCH** `/products/:id`
   - **Admin-only** – update existing product.

5. **DELETE** `/products/:id`
   - **Admin-only** – remove a product.

#### Cart Management

1. **GET** `/cart`
   - Returns the user’s cart (must be authenticated).

2. **POST** `/cart/add`
   - Body: `{ productId, quantity }`.
   - Adds item(s) to the user’s cart.

3. **POST** `/cart/remove`
   - Body: `{ productId }`.
   - Removes or decreases quantity of item(s) from the user’s cart.

#### Order Management

1. **POST** `/orders`
   - Converts the user’s cart into an order. 
   - Initiates payment process (Stripe or PayPal).

2. **GET** `/orders`
   - Returns the user’s own orders (if `user` role).
   - If `admin` role, can return all orders (or separate admin endpoint like `/admin/orders`).

3. **GET** `/orders/:id`
   - Returns details for a single order.

4. **PATCH** `/orders/:id`
   - **Admin-only** – update order status (`shipped`, `delivered`, etc.).

#### Estimation (AI) Management

1. **POST** `/estimation/new`
   - User uploads images, optional text description.
   - System calls **Groq Vision** + **LangGraph** to compute cost.
   - Saves an `Estimation` record and returns it to the user.

2. **GET** `/estimation/mine`
   - Returns all estimates requested by the authenticated user.

3. **GET** `/estimation/:id`
   - Returns a specific estimate (user must own it, or admin).

4. **PATCH** `/estimation/:id`
   - **Admin-only** – update the estimate status (e.g., override cost, mark `reviewed`, etc.).

#### Admin Endpoints

- Some frameworks might unify these endpoints with role checks. Alternatively, create a separate admin router. At minimum, admin should be able to:
  - **Manage users** (set roles, disable accounts).
  - **Manage products** (CRUD).
  - **Manage orders** (view/modify status).
  - **Manage categories** (if categories are separate documents).
  - **Review AI estimates** (approve, override price, etc.).

---

### 7. **Payments**

- Integrate with **Stripe** or **PayPal** for checkout:
  1. User clicks “Checkout” -> create an order.
  2. Order references user’s cart items. 
  3. Payment gateway usage:
     - If Stripe: create a payment intent, handle webhooks to confirm payment.
     - If PayPal: create an order, capture payment, confirm with webhooks.
  4. On payment success, update order status to `paid`.
  5. On payment failure or cancellation, handle gracefully.

---

### 8. **Best Practices**

- **Environment variables**: store secrets (JWT secret, DB credentials, Stripe keys, etc.).
- **Validation**: for any request body (use `class-validator` in NestJS or `express-validator`/Joi in Express).
- **Error handling**: uniform error response (status codes, messages).
- **Security**:
  - Role-based authorization for admin routes.
  - Data sanitization for user input.
  - Optional CSRF protection if needed.
- **ESLint/Prettier**: for code style.

---

### 9. **Documentation**

- Provide an **OpenAPI/Swagger** doc or Postman collection for easy endpoint testing.
  - If **NestJS**: use `@nestjs/swagger`.
  - If **Express**: use `swagger-ui-express` or a similar package.

---

### 10. **Dev Workflow**

- In `package.json`, include:
  - `"dev"` script: runs the server in watch mode.
  - `"build"` script: compiles TypeScript.
  - `"start"` script: runs the compiled code in production.
  - `"test"` script (optional): runs unit tests.
- Provide a **README** with instructions on:
  - **Setting up environment variables**.
  - **Running migrations or seed scripts**.
  - **Running the server** (dev/production).
  - **Integrating the AI agent code** (e.g., set a base URL for the AI service or place code in a folder).
  - **Uploading images** (if local or via S3 keys).

---

### 11. **Delivery**

- Generate **all relevant code files**, folder structures, and configurations.
- The final result should be:
  1. A **fully functional TypeScript backend** for a furniture e-commerce platform.
  2. Includes standard e-commerce features (browse products, cart, orders, payments).
  3. Includes **AI-based cost estimations** (build or repair) using Groq Vision & LangGraph.
  4. **Well-documented** via README and optional Swagger.
  5. **Easy to run** locally or deploy (with environment variables, scripts, etc.).

---

### 12. **Key Points Summary**

1. **User Registration & Authentication** (JWT-based or session).
2. **Admin & User Roles**:
   - Admin can list/edit/delete products and see all orders, etc.
   - User can browse products, add to cart, checkout.
3. **Products**:
   - Admin CRUD.
   - Users browse or filter.
4. **Cart** & **Orders**:
   - Standard e-commerce flow (add to cart, create order, pay).
5. **AI Estimation**:
   - Upload images -> call Groq Vision -> pass data to LangGraph -> store & return cost.
   - Admin can override or confirm final estimates.
6. **Documentation**: Provide API endpoints overview (Swagger recommended).
7. **README**: instructions for setup, environment variables, usage, and deployment.

---

**Thank you!** This is the final, **comprehensive prompt** for building the furniture-seller backend in TypeScript with both e-commerce and AI-based cost estimation features. Please generate the code according to these specifications.