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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArtistInfo } from "@/types";
import { Save, Mail } from "lucide-react";
import { updateArtistInfo } from "@/services/firebaseService";
import { useState } from "react";

const formSchema = z.object({
  emailjsServiceId: z.string().optional(),
  emailjsTemplateId: z.string().optional(),
  emailjsPublicKey: z.string().optional(),
});

interface AdminEmailJSFormProps {
  artistInfo: ArtistInfo;
}

export default function AdminEmailJSForm({ artistInfo }: AdminEmailJSFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailjsServiceId: artistInfo.emailjsServiceId || "",
      emailjsTemplateId: artistInfo.emailjsTemplateId || "",
      emailjsPublicKey: artistInfo.emailjsPublicKey || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await updateArtistInfo({
        ...artistInfo,
        ...values,
      });
      toast.success("Настройки EmailJS успешно сохранены!");
    } catch (error: any) {
      console.error("Failed to save EmailJS settings:", error);
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Не удалось сохранить настройки EmailJS: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl">
          <Mail size={20} className="text-primary" /> Интеграция EmailJS для отправки писем
        </CardTitle>
        <CardDescription>
          Позволяет отправлять сообщения из контактной формы сайта прямо на вашу личную почту.
          Зарегистрируйтесь на <a href="https://www.emailjs.com/" target="_blank" rel="noreferrer" className="underline hover:text-primary font-medium">emailjs.com</a>, создайте Service и Template, затем укажите ключи ниже.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="emailjsServiceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Service ID</FormLabel>
                    <FormControl>
                      <Input placeholder="service_xxxxxxx" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailjsTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Template ID</FormLabel>
                    <FormControl>
                      <Input placeholder="template_xxxxxxx" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailjsPublicKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Public Key</FormLabel>
                    <FormControl>
                      <Input placeholder="user_xxxxxxxxxxxx" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto gap-2 px-10" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? "Сохранение..." : "Сохранить настройки EmailJS"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
