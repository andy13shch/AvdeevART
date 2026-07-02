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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Artwork, Category } from "@/types";
import { CATEGORIES } from "@/constants";
import { Plus, Edit2, Save, FolderOpen, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { addArtwork, updateArtwork } from "@/services/firebaseService";

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
  title: z.string().min(2, { message: "Название должно содержать не менее 2 символов." }),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().refine((val) => {
    if (val.startsWith("/")) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Некорректная ссылка на изображение (укажите http/https URL или выберите локальный путь из папки)." }),
  category: z.string().min(1, { message: "Пожалуйста, выберите категорию." }),
  year: z.string().regex(/^\d{4}$/, { message: "Год должен состоять из 4 цифр." }),
});

interface AdminArtworkFormProps {
  mode: "add" | "edit";
  artwork?: Artwork;
}

export default function AdminArtworkForm({ mode, artwork }: AdminArtworkFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: artwork?.title || "",
      description: artwork?.description || "",
      imageUrl: artwork?.imageUrl || "",
      category: artwork?.category || "Живопись",
      year: artwork?.year || new Date().getFullYear().toString(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (mode === "add") {
        await addArtwork(values as any);
        toast.success("Работа добавлена!");
        form.reset();
      } else if (artwork) {
        await updateArtwork(artwork.id, values as any);
        toast.success("Работа обновлена!");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "add" ? (
            <Button className="gap-2">
              <Plus size={16} /> Добавить работу
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Edit2 size={14} /> Редактировать
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Добавить новую работу" : "Редактировать работу"}</DialogTitle>
          <DialogDescription>
            Заполните данные ниже, чтобы {mode === "add" ? "добавить новую работу в портфолио" : "обновить эту работу"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, Звездная ночь" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Год</FormLabel>
                    <FormControl>
                      <Input placeholder="2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 border border-border/60 p-3 rounded-lg bg-muted/20">
              {localImagesList.length > 0 && (
                <div className="space-y-2">
                  <FormLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <FolderOpen size={13} /> Локальные файлы в /public/images/
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      form.setValue("imageUrl", val, { shouldValidate: true });
                    }}
                    value={localImagesList.some((item) => item.url === form.watch("imageUrl")) ? form.watch("imageUrl") : ""}
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

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {localImagesList.length > 0 ? "Или укажите прямую ссылку (URL)" : "URL изображения"}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("imageUrl") && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Предпросмотр:</span>
                  <div className="relative aspect-video max-h-40 w-full rounded-md overflow-hidden border border-border bg-black/5">
                    <img
                      src={form.watch("imageUrl")}
                      alt="Предпросмотр изображения"
                      className="object-contain w-full h-full"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите вашу работу..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                <Save size={16} /> {isSubmitting ? "Сохранение..." : mode === "add" ? "Сохранить работу" : "Обновить работу"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
