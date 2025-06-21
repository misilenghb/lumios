
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: t('auth.validation.invalidEmail') }),
    password: z.string().min(1, { message: t('auth.validation.passwordRequired') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      login(values.email);
      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{t('auth.loginTitle')}</CardTitle>
            <CardDescription>{t('auth.loginDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('auth.emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.loginButton')}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t('auth.noAccountPrompt')}{" "}
              <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                {t('auth.registerLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
