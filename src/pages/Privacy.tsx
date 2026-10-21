import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Mail, Lock } from "lucide-react";
import { motion } from "motion/react";
import { ArtistInfo } from "@/types";

interface PrivacyProps {
  artistInfo?: ArtistInfo;
}

export default function Privacy({ artistInfo }: PrivacyProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactEmail = artistInfo?.email || "artist@avdeevart.ru";
  const siteName = artistInfo?.name || "AvdeevART";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Вернуться на главную
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <header className="border-b pb-6 space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck size={28} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Юридическая информация • 152-ФЗ
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Политика в отношении обработки персональных данных
          </h1>
          <p className="text-sm text-muted-foreground">
            Редакция действует с 21 октября 2026 г. • Сайт: avdeevart.ru
          </p>
        </header>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
          <h2 className="text-xl font-semibold font-serif text-foreground">1. Общие положения</h2>
          <p>
            1.1. Настоящая Политика обработки персональных данных (далее — «Политика») определяет порядок сбора,
            хранения, передачи и иных видов обработки персональных данных на сайте <strong>avdeevart.ru</strong> (далее
            — «Сайт»), а также меры по обеспечению их безопасности в соответствии с Федеральным законом РФ от
            27.07.2006 № 152-ФЗ «О персональных данных».
          </p>
          <p>
            1.2. Оператором персональных данных является владелец Сайта — <strong>{siteName}</strong> (далее —
            «Оператор»).
          </p>
          <p>
            1.3. Использование сервисов Сайта, включая отправку сообщений через контактные формы, означает
            безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его
            персональной информации.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
          <h2 className="text-xl font-semibold font-serif text-foreground">
            2. Состав обрабатываемых персональных данных
          </h2>
          <p>
            Оператор обрабатывает персональные данные, предоставляемые Пользователем добровольно при заполнении форм
            обратной связи:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-muted-foreground">
            <li>Имя Пользователя;</li>
            <li>Адрес электронной почты (e-mail);</li>
            <li>Номер контактного телефона (при наличии);</li>
            <li>Тема и содержание текстового сообщения;</li>
            <li>
              Обезличенные технические данные, автоматически передаваемые устройством Пользователя (IP-адрес, тип
              устройства, версия браузера, файлы cookie).
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
          <h2 className="text-xl font-semibold font-serif text-foreground">
            3. Цели обработки персональных данных
          </h2>
          <p>Сбор и обработка персональных данных осуществляются исключительно в следующих целях:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-muted-foreground">
            <li>Обработка входящих запросов, заявок и консультация по авторским картинам и графике;</li>
            <li>Установление обратной связи с Пользователем для обсуждения деталей сотрудничества;</li>
            <li>Обеспечение стабильной и корректной работы технических функций Сайта.</li>
          </ul>
          <p>
            Оператор <strong>не использует</strong> персональные данные для спам-рассылок и не передает их третьим
            лицам в рекламных или маркетинговых целях.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
          <h2 className="text-xl font-semibold font-serif text-foreground">
            4. Принципы и порядок обработки персональных данных
          </h2>
          <p>
            4.1. Обработка персональных данных осуществляется на законной и справедливой основе с соблюдением
            принципов конфиденциальности.
          </p>
          <p>
            4.2. Персональные данные хранятся не дольше, чем этого требуют цели обработки, либо до момента отзыва
            согласия Пользователем.
          </p>
          <p>
            4.3. Передача персональных данных третьим лицам не осуществляется, за исключением случаев, прямо
            предусмотренных действующим законодательством Российской Федерации.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
          <h2 className="text-xl font-semibold font-serif text-foreground">5. Файлы Cookie</h2>
          <p>
            Сайт использует файлы cookie и аналогичные технологии для обеспечения базовой функциональности, корректного
            отображения визуальных эффектов и запоминания пользовательских настроек (например, статуса согласия с
            уведомлениями). Пользователь может в любой момент отключить сохранение cookie в настройках своего браузера.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
          <h2 className="text-xl font-semibold font-serif text-foreground">
            6. Права Пользователя и отзыв согласия
          </h2>
          <p>
            6.1. Пользователь имеет право на получение информации, касающейся обработки его персональных данных, а
            также право требовать их уточнения, блокирования или уничтожения.
          </p>
          <p>
            6.2. Пользователь вправе в любой момент отозвать свое согласие на обработку персональных данных, направив
            письменное заявление Оператору по адресу электронной почты:{" "}
            <a href={`mailto:${contactEmail}`} className="text-primary underline hover:text-primary/80">
              {contactEmail}
            </a>
            . Оператор прекращает обработку и удаляет персональные данные в срок, не превышающий 10 рабочих дней с
            момента получения заявления.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90 border-t pt-6">
          <h2 className="text-xl font-semibold font-serif text-foreground">7. Контактная информация Оператора</h2>
          <div className="bg-muted/40 p-4 rounded-lg space-y-2 border">
            <p className="font-medium text-foreground">{siteName}</p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={16} /> Email для юридических вопросов и отзыва согласий:{" "}
              <a href={`mailto:${contactEmail}`} className="text-foreground underline">
                {contactEmail}
              </a>
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground/80">
              <Lock size={14} /> Все персональные данные защищены в соответствии с законодательством РФ.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
