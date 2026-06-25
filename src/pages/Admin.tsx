import { useState } from "react";
import { auth, signIn, logout } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Artwork, ArtistInfo } from "@/types";
import { LogIn, LogOut, Image as ImageIcon, User, Trash2, AlertCircle } from "lucide-react";
import AdminArtworkForm from "@/components/AdminArtworkForm";
import AdminArtistForm from "@/components/AdminArtistForm";
import { motion, AnimatePresence } from "motion/react";
import { deleteArtwork } from "@/services/firebaseService";
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
  const adminEmails = ["andy13shch@gmail.com", "semenavdeev2010@gmail.com"];
  const isAdmin = user?.email && adminEmails.includes(user.email);

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
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="w-full border border-border bg-card shadow-2xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="font-serif text-3xl">Доступ администратора</CardTitle>
              <CardDescription className="text-base">
                Пожалуйста, войдите, чтобы управлять портфолио и профилем.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8 px-6">
              <Button onClick={handleLogin} className="w-full gap-3 py-6 text-lg font-medium transition-all hover:scale-[1.02]">
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
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="w-full border border-border bg-card shadow-2xl text-center">
            <CardHeader className="space-y-2">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
              <CardTitle className="font-serif text-3xl">Доступ запрещен</CardTitle>
              <CardDescription className="text-base">
                У вас нет прав для доступа к панели администратора.
                {user?.email && <div className="mt-2 text-sm font-semibold text-destructive">({user.email})</div>}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 px-6">
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
    <div className="container mx-auto px-4 py-12">
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
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="artworks" className="gap-2">
            <ImageIcon size={16} /> Работы
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User size={16} /> Профиль художника
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
