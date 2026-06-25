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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArtistInfo } from "@/types";
import { Save, User, Mail, Phone, Instagram, Send, Image as ImageIcon } from "lucide-react";
import { updateArtistInfo } from "@/services/firebaseService";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов." }),
  bio: z.string().min(10, { message: "Биография должна содержать не менее 10 символов." }),
  email: z.string().email({ message: "Некорректный адрес электронной почты." }),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
  profileImageUrl: z.string().url({ message: "Некорректная ссылка на изображение." }).optional().or(z.literal("")),
  homeHeroBgUrl: z.string().url({ message: "Некорректная ссылка на изображение." }).optional().or(z.literal("")),
  homeHeroSubtitle: z.string().optional(),
  homePortfolioSubtitle: z.string().optional(),
});

interface AdminArtistFormProps {
  artistInfo: ArtistInfo;
}

export default function AdminArtistForm({ artistInfo }: AdminArtistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: artistInfo.name || "",
      bio: artistInfo.bio || "",
      email: artistInfo.email || "",
      phone: artistInfo.phone || "",
      instagram: artistInfo.instagram || "",
      telegram: artistInfo.telegram || "",
      profileImageUrl: artistInfo.profileImageUrl || "",
      homeHeroBgUrl: artistInfo.homeHeroBgUrl || "",
      homeHeroSubtitle: artistInfo.homeHeroSubtitle || "",
      homePortfolioSubtitle: artistInfo.homePortfolioSubtitle || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await updateArtistInfo(values as ArtistInfo);
      toast.success("Профиль обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить профиль.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} /> Редактировать профиль художника
        </CardTitle>
        <CardDescription>
          Обновите свою личную информацию, биографию и ссылки на социальные сети.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Полное имя</FormLabel>
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
                    <FormLabel>Контактный Email</FormLabel>
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
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Биография</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Расскажите свою историю..."
                      className="min-h-[200px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon size={14} /> URL изображения профиля
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/profile.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-medium font-serif mb-4 flex items-center gap-2">
                <ImageIcon size={18} /> Настройки главной страницы
              </h3>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="homeHeroBgUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        URL фонового изображения (Home Hero Background)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://images-assets.nasa.gov/image/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="homeHeroSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подзаголовок под названием сайта (Home Subtitle)</FormLabel>
                        <FormControl>
                          <Input placeholder="Исследование границ восприятия через свет..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homePortfolioSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Текст под надписью "Портфолио"</FormLabel>
                        <FormControl>
                          <Input placeholder="Коллекция работ, исследующих пересечение света..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone size={14} /> Телефон
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Instagram size={14} /> Instagram URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/vash_nik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telegram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Send size={14} /> Telegram URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://t.me/vash_nik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto gap-2 px-12" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? "Сохранение..." : "Сохранить профиль"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
