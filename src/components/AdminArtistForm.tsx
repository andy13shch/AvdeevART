import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArtistInfo } from "@/types";
import { Save, User, Mail, Phone, Instagram, Send, Image as ImageIcon, RotateCcw, Shield, FolderOpen, Upload, Loader2 } from "lucide-react";
import { updateArtistInfo } from "@/services/firebaseService";
import { useState } from "react";
import { processImageFile } from "@/lib/heicHelper";
import { HeicImage } from "./HeicImage";
import { LOCAL_IMAGES } from "../images-list";

const localImagesList = LOCAL_IMAGES.map((filename) => ({
  name: filename,
  url: `/images/${filename}`,
}));

// Group images by folder
const groupedImages = localImagesList.reduce((acc, item) => {
  const parts = item.name.split('/');
  if (parts.length > 1) {
    const folder = parts[0];
    const name = parts.slice(1).join('/');
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push({ ...item, displayName: name });
  } else {
    const folder = "Корень";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push({ ...item, displayName: item.name });
  }
  return acc;
}, {} as Record<string, { name: string; url: string; displayName: string }[]>);

const formSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов." }),
  bio: z.string().min(10, { message: "Биография должна содержать не менее 10 символов." }),
  email: z.string().email({ message: "Некорректный адрес электронной почты." }),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
  profileImageUrl: z.string().refine((val) => {
    if (!val) return true;
    if (val.startsWith("/")) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Некорректная ссылка на изображение (укажите http/https URL или выберите локальный путь из папки)." }).optional().or(z.literal("")),
  homeHeroBgUrl: z.string().refine((val) => {
    if (!val) return true;
    if (val.startsWith("/")) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Некорректная ссылка на изображение (укажите http/https URL или выберите локальный путь из папки)." }).optional().or(z.literal("")),
  homeHeroSubtitle: z.string().optional(),
  homePortfolioSubtitle: z.string().optional(),
});

interface AdminArtistFormProps {
  artistInfo: ArtistInfo;
}

export default function AdminArtistForm({ artistInfo }: AdminArtistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProfile(true);
    try {
      const isHeicFile = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
      if (isHeicFile) {
        toast.info("Конвертируем HEIC в JPEG формат...");
      }
      const base64Url = await processImageFile(file);
      form.setValue("profileImageUrl", base64Url, { shouldValidate: true });
      toast.success("Фото профиля успешно загружено и подготовлено!");
    } catch (err: any) {
      console.error(err);
      toast.error("Не удалось загрузить или обработать фото.");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBg(true);
    try {
      const isHeicFile = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
      if (isHeicFile) {
        toast.info("Конвертируем HEIC в JPEG формат...");
      }
      const base64Url = await processImageFile(file);
      form.setValue("homeHeroBgUrl", base64Url, { shouldValidate: true });
      toast.success("Фоновое изображение успешно загружено и подготовлено!");
    } catch (err: any) {
      console.error(err);
      toast.error("Не удалось загрузить или обработать фон.");
    } finally {
      setIsUploadingBg(false);
    }
  };

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
      await updateArtistInfo({
        ...artistInfo,
        ...values
      });
      toast.success("Профиль обновлен!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Не удалось обновить профиль: ${msg}`);
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
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border border-border/60 p-4 rounded-lg bg-muted/20">
              <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                <ImageIcon size={16} /> Картинка профиля "обо мне"
              </h4>
              
              {localImagesList.length > 0 && (
                <div className="space-y-2">
                  <FormLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <FolderOpen size={13} /> Выбрать из загруженных в /public/images/
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      form.setValue("profileImageUrl", val, { shouldValidate: true });
                    }}
                    value={localImagesList.some((item) => item.url === form.watch("profileImageUrl")) ? form.watch("profileImageUrl") : ""}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Выбрать загруженный файл..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(groupedImages).map(([folderName, items]) => (
                        <SelectGroup key={folderName}>
                          <SelectLabel className="font-semibold text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded mt-1">{folderName}</SelectLabel>
                          {items.map((item) => (
                            <SelectItem key={item.url} value={item.url}>
                              {item.displayName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Upload size={13} /> Загрузить фото профиля
                </FormLabel>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleProfileUpload}
                    disabled={isUploadingProfile || isSubmitting}
                    className="cursor-pointer file:text-primary file:hover:underline bg-background"
                  />
                  {isUploadingProfile && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground">Поддерживает HEIC (с iPhone), PNG, JPG, GIF</p>
              </div>

              <FormField
                control={form.control}
                name="profileImageUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Или укажите прямую ссылку (URL)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/profile.jpg" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("profileImageUrl") && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Предпросмотр профиля:</span>
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border border-border bg-black/5">
                    <HeicImage
                      src={form.watch("profileImageUrl")}
                      alt="Предпросмотр профиля"
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-medium font-serif mb-4 flex items-center gap-2">
                <ImageIcon size={18} /> Настройки главной страницы
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-4 border border-border/60 p-4 rounded-lg bg-muted/20">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <ImageIcon size={16} /> Фоновое изображение сайта (Home Hero Background)
                  </h4>
                  
                  {localImagesList.length > 0 && (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <FolderOpen size={13} /> Выбрать из загруженных в /public/images/
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          form.setValue("homeHeroBgUrl", val, { shouldValidate: true });
                        }}
                        value={localImagesList.some((item) => item.url === form.watch("homeHeroBgUrl")) ? form.watch("homeHeroBgUrl") : ""}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Выбрать загруженный файл..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(groupedImages).map(([folderName, items]) => (
                            <SelectGroup key={folderName}>
                              <SelectLabel className="font-semibold text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded mt-1">{folderName}</SelectLabel>
                              {items.map((item) => (
                                <SelectItem key={item.url} value={item.url}>
                                  {item.displayName}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Upload size={13} /> Загрузить фоновое изображение
                    </FormLabel>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={handleBgUpload}
                        disabled={isUploadingBg || isSubmitting}
                        className="cursor-pointer file:text-primary file:hover:underline bg-background"
                      />
                      {isUploadingBg && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Поддерживает HEIC (с iPhone), PNG, JPG, GIF</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="homeHeroBgUrl"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Или укажите прямую ссылку (URL)
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="https://example.com/background.jpg" {...field} className="bg-background" />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              field.onChange("https://images-assets.nasa.gov/image/art002e009298/art002e009298~large.jpg");
                              toast.info("Восстановлен фоновый рисунок по умолчанию. Не забудьте сохранить изменения.");
                            }}
                            className="gap-1 px-3 bg-background"
                            title="Вернуть по умолчанию"
                          >
                            <RotateCcw size={14} />
                            <span className="hidden sm:inline">Вернуть</span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("homeHeroBgUrl") && (
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground">Предпросмотр фона:</span>
                      <div className="relative aspect-video max-h-32 w-full rounded-md overflow-hidden border border-border bg-black/5">
                        <HeicImage
                          src={form.watch("homeHeroBgUrl")}
                          alt="Предпросмотр фона"
                          className="object-cover w-full h-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="homeHeroSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подзаголовок под названием сайта (Home Subtitle)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="Исследование границ восприятия через свет..." {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              field.onChange("Исследование границ восприятия через свет, цвет и текстуру.");
                              toast.info("Восстановлен подзаголовок сайта по умолчанию. Не забудьте сохранить изменения.");
                            }}
                            className="gap-1 px-3"
                            title="Вернуть по умолчанию"
                          >
                            <RotateCcw size={14} />
                            <span className="hidden sm:inline">Вернуть</span>
                          </Button>
                        </div>
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
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="Коллекция работ, исследующих пересечение света..." {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              field.onChange("Коллекция работ, исследующих пересечение света и эмоций.");
                              toast.info("Восстановлено описание портфолио по умолчанию. Не забудьте сохранить изменения.");
                            }}
                            className="gap-1 px-3"
                            title="Вернуть по умолчанию"
                          >
                            <RotateCcw size={14} />
                            <span className="hidden sm:inline">Вернуть</span>
                          </Button>
                        </div>
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
