import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AdminContact = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const textareaRef = useRef(null);

  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendURL}/api/admin/contact`, {
        withCredentials: true,
      });
      if (data.success) setMessages(data.data);
      else toast.error(data.message || "Failed to fetch messages");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch messages. Are you logged in as admin?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ---------------- Soft Delete ----------------
  const handleSoftDelete = async (id) => {
    try {
      const { data } = await axios.put(`${backendURL}/api/admin/contact/${id}/delete`, {}, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete message");
    }
  };

  // ---------------- Restore ----------------
  const handleRestore = async (id) => {
    try {
      const { data } = await axios.put(`${backendURL}/api/admin/contact/${id}/restore`, {}, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore message");
    }
  };

  // ---------------- Reply ----------------
  const handleReply = async () => {
    if (!replyMessage) return toast.error("Please type your reply");

    try {
      const { data } = await axios.put(
        `${backendURL}/api/admin/contact/${selectedMessage._id}/reply`,
        { reply: replyMessage },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Replied successfully");
        setSelectedMessage(null);
        setReplyMessage("");
        fetchMessages();
      } else toast.error(data.message || "Failed to send reply");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reply");
    }
  };

  useEffect(() => {
    if (selectedMessage && textareaRef.current) textareaRef.current.focus();
  }, [selectedMessage]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Feedback</h1>

      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No messages found</p>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`shadow-md rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 ${
                msg.isDeleted === 0 ? "bg-gray-100 text-gray-400 line-through" : "bg-white"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold">{msg.name}</p>
                <p className="text-sm">{msg.email}</p>
                <p className="mt-2">{msg.message}</p>
              </div>
              <div className="flex items-center gap-2">
                {msg.isDeleted === 1 ? (
                  <>
                    {msg.reply ? (
                      <span className="text-green-600 font-medium">{msg.reply}</span>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        onClick={() => setSelectedMessage(msg)}
                      >
                        Reply
                      </button>
                    )}
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      onClick={() => handleSoftDelete(msg._id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    onClick={() => handleRestore(msg._id)}
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedMessage && (
        <>
          {/* Background Blur */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
            onClick={() => setSelectedMessage(null)}
          ></div>

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">Reply to {selectedMessage.name}</h2>
              <textarea
                ref={textareaRef}
                rows={5}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full border border-gray-300 rounded px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                  onClick={() => setSelectedMessage(null)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={handleReply}
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminContact;
