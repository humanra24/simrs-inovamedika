import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Selamat datang di SIMRS Inovamedika.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">
            Halaman dashboard sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
