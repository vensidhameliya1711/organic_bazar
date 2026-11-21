
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import api from "../api/api";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    type: "feedback",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [fetching, setFetching] = useState(false);

  const messagesEndRef = useRef(null);
  // const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/user/contact", form);


      if (data.success) {
        toast.success("Message sent successfully!");
        setForm({ name: "", type: "feedback", message: "" });
        fetchMessages();
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setFetching(true);
      const { data } = await api.get("/api/user/contact/messages");


      if (data.success) {
        const sorted = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMessages(sorted);
      }
    // } catch (err) {
    //   toast.error("Failed to fetch messages");
    }catch (err) {
  // Agar user login nahi hai to silently ignore karo
  console.log("User not logged in or no messages access");
  setMessages([]); // empty hi dikhao
}

     finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <main className="mt-16 bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-100 px-6 md:px-16 lg:px-24 py-16">

      {/* TOP HEADING */}
      <div className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-800 mb-4">
          Contact Organic Bazar
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-lg">
          Have questions, feedback or suggestions? We’d love to hear from you!
        </p>
      </div>

      {/* GRID */}
      <div className="flex flex-col md:flex-row gap-12">

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 p-8 bg-white/80 backdrop-blur-md 
          shadow-2xl rounded-3xl border border-emerald-200"
        >
          <h2 className="text-2xl font-bold text-emerald-700 mb-4">
            Send us a Message 
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="border border-emerald-300 rounded-xl px-4 py-3 outline-none 
            focus:ring-2 focus:ring-emerald-500 bg-white"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border border-emerald-300 rounded-xl px-4 py-3 outline-none
            focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="feedback">Feedback</option>
            <option value="question">Question</option>
          </select>

          <textarea
            name="message"
            placeholder="Your Message"
            rows={6}
            value={form.message}
            onChange={handleChange}
            className="border border-emerald-300 rounded-xl px-4 py-3 outline-none 
            focus:ring-2 focus:ring-emerald-500 bg-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 
            text-white px-6 py-3 rounded-xl font-semibold shadow-lg 
            hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* MESSAGE LIST */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="p-6 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl 
          border border-emerald-200 max-h-[600px] overflow-y-auto">

            <h2 className="text-2xl font-bold mb-4 text-emerald-700">
              My Queries / Feedback
            </h2>

            {fetching ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500">
                No messages yet. Start by sending one!
              </p>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className="bg-emerald-50 border-l-4 border-emerald-400 
                    p-4 rounded-xl shadow-sm mb-4 hover:bg-emerald-100 transition"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-lg capitalize text-emerald-700">
                        {msg.type}
                      </p>

                      <span
                        className={`text-sm px-3 py-1 rounded-full font-medium ${
                          msg.reply
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-yellow-200 text-yellow-900"
                        }`}
                      >
                        {msg.reply ? "Answered" : "Pending"}
                      </span>
                    </div>

                    <p className="mt-2 text-gray-700">{msg.message}</p>

                    {msg.reply && (
                      <div className="mt-3 p-3 bg-emerald-100 rounded-lg">
                        <p className="text-emerald-800 font-medium">
                          Admin Reply:
                        </p>
                        <p className="text-emerald-700">{msg.reply}</p>
                      </div>
                    )}

                    <p className="text-gray-500 text-sm mt-2">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* DIRECT CONTACT */}
          <div className="p-6 bg-gradient-to-br from-emerald-100 via-cyan-100 to-teal-100 
          rounded-3xl border border-emerald-300 shadow-lg">

            <h2 className="text-2xl font-bold text-emerald-800 mb-3">
              Reach Us Directly
            </h2>

            <p>
              Email:{" "}
              <a
                href="mailto:support@organicbazar.com"
                className="text-emerald-700 font-medium"
              >
                support@organicbazar.com
              </a>
            </p>

            <p>
              Phone:{" "}
              <a
                href="tel:+919876543210"
                className="text-emerald-700 font-medium"
              >
                +91 98765 43210
              </a>
            </p>

            <p>
              Address:{" "}
              <span className="text-emerald-700 font-medium">
                Organic Bazar HQ, Green Valley Road, Gujarat, India
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactUs;
