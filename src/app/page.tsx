import { redirect } from "next/navigation";

// ルートアクセスはログインページへリダイレクト
export default function Home() {
  redirect("/login");
}
