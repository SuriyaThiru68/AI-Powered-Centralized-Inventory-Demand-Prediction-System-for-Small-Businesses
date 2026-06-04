import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return <div className="alert alert-success">Thank you. Our team will respond within one business day.</div>;
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-4 md:grid-cols-2"
    >
      <div className="form-group">
        <label className="form-label">First Name</label>
        <input className="form-control" required />
      </div>
      <div className="form-group">
        <label className="form-label">Last Name</label>
        <input className="form-control" required />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input type="email" className="form-control" required />
      </div>
      <div className="form-group">
        <label className="form-label">Company</label>
        <input className="form-control" />
      </div>
      <div className="form-group md:col-span-2">
        <label className="form-label">Message</label>
        <textarea className="form-control" rows={4} />
      </div>
      <div className="md:col-span-2">
        <button type="submit" className="btn btn-primary">
          Submit <Send size={16} />
        </button>
      </div>
    </form>
  );
}
