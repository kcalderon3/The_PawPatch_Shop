import { useState } from "react";
import { subscribeEmail } from "../lib/api.js";

export function useSubscribe() {
  const [email, setEmail] = useState("");
  const [subscribeError, setSubscribeError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  async function submitSubscription(event) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribeError("");

    try {
      await subscribeEmail(email.trim());
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      setSubscribeError(error.message || "Could not subscribe right now.");
    }
  }

  return {
    email,
    setEmail,
    subscribeError,
    subscribed,
    submitSubscription,
  };
}
