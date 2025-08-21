import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">Vérifiez votre email</CardTitle>
          <CardDescription>Un lien de confirmation a été envoyé à votre adresse email</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-slate-600">
            Cliquez sur le lien dans l'email pour activer votre compte et commencer à utiliser le gestionnaire de
            tâches.
          </p>
          <Link href="/auth/login" className="text-blue-600 hover:underline text-sm">
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
