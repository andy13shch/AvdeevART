import { useState, useEffect } from "react";
import { auth, signIn, logout } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Artwork, ArtistInfo, ContactMessage } from "@/types";
import { LogIn, LogOut, Image as ImageIcon, User, Trash2, AlertCircle, Mail, Calendar } from "lucide-react";
import AdminArtworkForm from "@/components/AdminArtworkForm";
import AdminArtistForm from "@/components/AdminArtistForm";
import { motion, AnimatePresence } from "motion/react";
import { deleteArtwork, subscribeToMessages, deleteMessage } from "@/services/firebaseService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminProps {
  artworks: Artwork[];
  artistInfo: ArtistInfo;
  user: any;
}

export default function Admin({ artworks, artistInfo, user }: AdminProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const adminEmails = [
    "andy13shch@gmail.com",
    "semenavdeev2010@gmail.com",
    "aaavdeeva13@yandex.ru",
    "aaavdeeva2013@gmail.com"
  ];
  const isAdmin = user?.email && adminEmails.includes(user.email);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = subscribeToMessages((msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id);
      toast.success("Сообщение успешно удалено.");
    } catch (error) {
      toast.error("Не удалось удалить сообщение.");
    }
  };

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Ошибка входа. Пожалуйста, попробуйте еще раз.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await deleteArtwork(isDeleting);
      toast.success("Работа удалена.");
    } catch (error) {
      toast.error("Не удалось удалить работу.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[80vh] pt-24 pb-12 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="w-full border border-border bg-card shadow-2xl p-4 sm:p-6">
            <CardHeader className="text-center space-y-3">
              <CardTitle className="font-serif text-2xl sm:text-3xl tracking-tight leading-normal">
                Доступ администратора
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground">
                Пожалуйста, войдите, чтобы управлять портфолио и профилем.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6 pt-2 px-6">
              <Button onClick={handleLogin} className="w-full gap-3 py-6 text-base sm:text-lg font-medium transition-all hover:scale-[1.02]">
                <LogIn size={20} /> Войти через Google
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[80vh] pt-24 pb-12 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="w-full border border-border bg-card shadow-2xl text-center p-4 sm:p-6">
            <CardHeader className="space-y-3">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
              <CardTitle className="font-serif text-2xl sm:text-3xl tracking-tight leading-normal">
                Доступ запрещен
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground">
                У вас нет прав для доступа к панели администратора.
                {user?.email && (
                  <div className="mt-3 text-sm font-semibold text-destructive bg-destructive/10 py-1.5 px-3 rounded-md inline-block">
                    {user.email}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 pt-2 px-6">
              <Button variant="outline" onClick={handleLogout} className="w-full py-6 text-base">
                Выйти и попробовать другой аккаунт
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tighter">
            ПАНЕЛЬ УПРАВЛЕНИЯ
          </h1>
          <p className="text-muted-foreground">
            Управляйте своими работами и информацией профиля.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut size={16} /> Выйти
        </Button>
      </div>

      <Tabs defaultValue="artworks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mb-8">
          <TabsTrigger value="artworks" className="gap-2">
            <ImageIcon size={16} /> Работы
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User size={16} /> Профиль
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <Mail size={16} /> Сообщения
            {messages.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full leading-none">
                {messages.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="artworks">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Ваши работы</h2>
                <AdminArtworkForm mode="add" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork, index) => (
                  <Card key={`${artwork.id}-${index}`} className="overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{artwork.title}</h3>
                        <span className="text-xs text-muted-foreground">{artwork.year}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {artwork.description}
                      </p>
                      <div className="flex gap-2">
                        <AdminArtworkForm mode="edit" artwork={artwork} />
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => setIsDeleting(artwork.id)}
                        >
                          <Trash2 size={14} /> Удалить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AdminArtistForm artistInfo={artistInfo} />
            </motion.div>
          </TabsContent>

          <TabsContent value="messages">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Входящие сообщения</h2>
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  Всего: {messages.length}
                </span>
              </div>

              {messages.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-2">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <CardTitle className="text-lg font-medium mb-1">Нет новых сообщений</CardTitle>
                  <CardDescription>
                    Когда пользователи отправят сообщения через форму контактов, они появятся здесь.
                  </CardDescription>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {messages.map((msg) => (
                    <Card key={msg.id} className="border border-border shadow-sm hover:shadow-md transition-all">
                      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                            Тема: {msg.subject}
                          </span>
                          <CardTitle className="text-lg font-serif mt-2">
                            {msg.name}
                          </CardTitle>
                          <div className="text-sm text-primary hover:underline">
                            <a href={`mailto:${msg.email}`}>{msg.email}</a>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground self-start md:self-center">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(msg.createdAt).toLocaleString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteMessage(msg.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2 border-t border-border bg-muted/20">
                        <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                          {msg.message}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <AlertDialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Это навсегда удалит работу из вашего портфолио.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
