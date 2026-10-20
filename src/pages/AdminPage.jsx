import React, { useCallback, useEffect, useState } from "react";
import {
  browserSupabase,
  fetchAdminOrders,
  updateAdminOrder,
} from "../lib/api.js";
import { formatMoney } from "../utils/formatMoney.js";

const REVIEW_SHIPPING_STATES = ["AK", "HI", "PR", "GU", "VI", "AS", "MP"];

export function AdminPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!browserSupabase) return;

    browserSupabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = browserSupabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadOrders = useCallback(async () => {
    if (!session?.access_token) return;

    setLoadingOrders(true);
    setAdminError("");

    try {
      const payload = await fetchAdminOrders(session.access_token);
      setOrders(payload.orders || []);
    } catch (error) {
      setAdminError(error.message || "Could not load orders.");
    } finally {
      setLoadingOrders(false);
    }
  }, [session]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function requestMagicLink(event) {
    event.preventDefault();
    setAdminMessage("");
    setAdminError("");

    if (!browserSupabase) {
      setAdminError("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable admin login.");
      return;
    }

    const { error } = await browserSupabase.auth.signInWithOtp({
      email: adminEmail,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });

    if (error) {
      setAdminError(error.message);
      return;
    }

    setAdminMessage("Check your email for the admin sign-in link.");
  }

  async function updateOrder(orderId, changes) {
    if (!session?.access_token) return;

    setAdminError("");

    try {
      await updateAdminOrder(session.access_token, orderId, changes);
      await loadOrders();
    } catch (error) {
      setAdminError(error.message || "Could not update order.");
    }
  }

  return (
    <main id="top" className="admin-page">
      <section className="admin-hero">
        <p className="eyebrow">Private dashboard</p>
        <h1>
          Order
          <span>Admin</span>
        </h1>
      </section>

      <section className="admin-panel">
        {!session ? (
          <AdminLogin
            adminEmail={adminEmail}
            adminError={adminError}
            adminMessage={adminMessage}
            onEmailChange={setAdminEmail}
            onSubmit={requestMagicLink}
          />
        ) : (
          <AdminOrders
            adminError={adminError}
            loadingOrders={loadingOrders}
            loadOrders={loadOrders}
            orders={orders}
            session={session}
            updateOrder={updateOrder}
          />
        )}
      </section>
    </main>
  );
}

function AdminLogin({
  adminEmail,
  adminError,
  adminMessage,
  onEmailChange,
  onSubmit,
}) {
  return (
    <form className="admin-login" onSubmit={onSubmit}>
      <h2>Sign in with your admin email.</h2>
      <label>
        Email
        <input
          type="email"
          value={adminEmail}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <button className="primary-button">Send magic link</button>
      {adminMessage && <p className="success">{adminMessage}</p>}
      {adminError && <p className="form-error">{adminError}</p>}
    </form>
  );
}

function AdminOrders({
  adminError,
  loadingOrders,
  loadOrders,
  orders,
  session,
  updateOrder,
}) {
  return (
    <>
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow dark">Signed in</p>
          <h2>{session.user.email}</h2>
        </div>
        <div className="admin-actions">
          <button className="secondary-button" onClick={loadOrders}>
            {loadingOrders ? "Refreshing..." : "Refresh"}
          </button>
          <button
            className="secondary-button"
            onClick={() => browserSupabase.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
      {adminError && <p className="form-error">{adminError}</p>}
      {!orders.length ? (
        <p className="empty-cart">
          {loadingOrders ? "Loading orders..." : "No live orders yet."}
        </p>
      ) : (
        <div className="admin-orders">
          {orders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              updateOrder={updateOrder}
            />
          ))}
        </div>
      )}
    </>
  );
}

function AdminOrderCard({ order, updateOrder }) {
  const needsShippingReview = REVIEW_SHIPPING_STATES.includes(order.shipping_state);

  return (
    <article className="admin-order">
      <div>
        <p className="eyebrow dark">{order.status}</p>
        <h3>{order.customer_email || "Guest customer"}</h3>
        <p>{formatMoney((order.total_cents || 0) / 100)}</p>
        {order.shipping_state && (
          <p>
            Ship to {order.shipping_state}
            {needsShippingReview && " - review non-continental destination"}
          </p>
        )}
      </div>
      <label>
        Fulfillment status
        <select
          value={order.fulfillment_status || "needs_review"}
          onChange={(event) =>
            updateOrder(order.id, {
              fulfillment_status: event.target.value,
            })
          }
        >
          <option value="needs_review">Needs review</option>
          <option value="design_sent">Design sent</option>
          <option value="approved">Approved</option>
          <option value="in_production">In production</option>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
      <label>
        Admin notes
        <textarea
          defaultValue={order.admin_notes || ""}
          onBlur={(event) =>
            updateOrder(order.id, { admin_notes: event.target.value })
          }
        />
      </label>
    </article>
  );
}
