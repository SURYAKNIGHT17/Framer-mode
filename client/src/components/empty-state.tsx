import { motion } from "framer-motion";
import { Shield, CheckCircle2, Search } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-8"
    >
      <div className="relative w-64 h-64 mb-8">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
            <Shield className="h-32 w-32 text-primary relative z-10" strokeWidth={1.5} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-8 right-8"
        >
          <div className="bg-success/20 p-3 rounded-full">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 left-8"
        >
          <div className="bg-primary/20 p-3 rounded-full">
            <Search className="h-8 w-8 text-primary" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center space-y-4 max-w-lg"
        data-testid="empty-state"
      >
        <h1 className="text-4xl font-bold text-foreground" data-testid="text-empty-title">
          Analyze AI Output
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-empty-description">
          Paste or upload text to verify claims with supporting evidence and get a comprehensive Trust Score with explainable results
        </p>
      </motion.div>
    </motion.div>
  );
}
