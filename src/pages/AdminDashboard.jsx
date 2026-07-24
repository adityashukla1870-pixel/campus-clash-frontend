import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CreditCard, Radio, Trophy, Medal, ChevronRight } from "lucide-react"
import AdminLayout from "../components/AdminLayout"


const adminActions = [
  { icon: CreditCard, label: "Payment Verification", desc: "Review & approve pending payments", path: "/admin/payments", accent: "gold" },
  { icon: Radio, label: "Release Room", desc: "Share room ID & password with players", path: "/admin/release-room", accent: "cyan" },
  { icon: Trophy, label: "Create Tournament", desc: "Set up a new esports tournament", path: "/admin/create-tournament", accent: "purple" },
  { icon: Medal, label: "Declare Winner", desc: "Finalize results and announce winner", path: "/admin/winner", accent: "green" },
]

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
}

function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Manage tournaments, payments, and match operations.">
      <div className="admin-grid">
        {adminActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.path}
              className={`admin-action-card glass-card-static accent-top-${action.accent === "gold" ? "gold" : action.accent}`}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => navigate(action.path)}
            >
              <div className={`admin-action-icon admin-icon-${action.accent}`}>
                <Icon size={22} />
              </div>
              <h3>{action.label}</h3>
              <p>{action.desc}</p>
              <ChevronRight size={18} className="admin-action-arrow" />
            </motion.div>
          )
        })}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
