import ContactForm from "@/components/ContactForm";
import { motion } from "motion/react";

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h1 className="font-serif text-5xl font-bold tracking-tighter md:text-7xl">
          СВЯЖИТЕСЬ СО МНОЙ
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          По вопросам приобретения работ, заказов или сотрудничества, пожалуйста, обращайтесь.
        </p>
      </motion.div>

      <ContactForm />
    </div>
  );
}
