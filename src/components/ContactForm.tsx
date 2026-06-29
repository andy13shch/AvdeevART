import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { addMessage, subscribeToArtistInfo } from "@/services/firebaseService";
import { Loader2 } from "lucide-react";
import { ArtistInfo } from "@/types";
import emailjs from "@emailjs/browser";

const formSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов." }),
  email: z.string().email({ message: "Некорректный адрес электронной почты." }),
  subject: z.string().min(5, { message: "Тема должна содержать не менее 5 символов." }),
  message: z.string().min(10, { message: "Сообщение должно содержать не менее 10 символов." }),
});

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToArtistInfo((data) => {
      setArtistInfo(data);
    });
    return () => unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // 1. Always save to Firestore so messages are never lost
      await addMessage(values);

      // 2. Check if EmailJS is configured
      const metaEnv = (import.meta as any).env || {};
      const serviceId = artistInfo?.emailjsServiceId || metaEnv.VITE_EMAILJS_SERVICE_ID;
      const templateId = artistInfo?.emailjsTemplateId || metaEnv.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = artistInfo?.emailjsPublicKey || metaEnv.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              from_name: values.name,
              name: values.name,
              from_email: values.email,
              email: values.email,
              subject: values.subject,
              message: values.message,
              to_email: artistInfo?.email || "",
            },
            publicKey
          );
          toast.success("Сообщение отправлено и продублировано на почту!", {
            description: "Художник свяжется с вами в ближайшее время.",
          });
        } catch (emailError) {
          console.error("EmailJS Error:", emailError);
          // If email fails but Firestore succeeded, inform the user
          toast.success("Сообщение отправлено на сайт!", {
            description: "Запись успешно сохранена, но возникла ошибка при дублировании на почту.",
          });
        }
      } else {
        // Fallback when EmailJS is not configured
        toast.success("Сообщение успешно отправлено!", {
          description: "Художник свяжется с вами в ближайшее время.",
        });
      }
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при отправке сообщения", {
        description: "Пожалуйста, попробуйте еще раз позже.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-lg mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Ваше имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="vash@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тема</FormLabel>
                <FormControl>
                  <Input placeholder="Вопрос о..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сообщение</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Расскажите подробнее о вашем вопросе..."
                    className="min-h-[150px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-12 gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Отправка..." : "Отправить сообщение"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
