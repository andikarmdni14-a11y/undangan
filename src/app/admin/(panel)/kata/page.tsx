import { requireAdmin } from "@/lib/admin/auth";
import { addBlockedWord, removeBlockedWord } from "../../actions";
import ActionForm from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/ConfirmButton";

export default async function WordsPage() {
  const { supabase } = await requireAdmin();
  const { data: words } = await supabase.from("blocked_words").select("word").order("word");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h3">Filter Kata Kasar</h1>
        <p className="mt-1 max-w-xl text-small text-ink-muted">
          Kata di bawah otomatis diganti bintang (****) pada ucapan baru. Pencocokan per kata utuh dan tahan huruf berulang
          (mis. “anjiiing”), sehingga “pantai” tidak terkena “tai”.
        </p>
      </div>
      <ActionForm action={addBlockedWord} className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-start">
        <label htmlFor="word" className="sr-only">Kata baru</label>
        <input id="word" name="word" required maxLength={40} placeholder="kata baru" className="min-h-11 flex-1 rounded-full border border-rose-300 bg-alabaster px-4" />
        <SubmitButton pendingText="…" className="min-h-11 rounded-full bg-burgundy px-6 text-small font-medium text-alabaster">Tambah</SubmitButton>
      </ActionForm>
      <ul className="flex flex-wrap gap-2" aria-label={`${words?.length ?? 0} kata terdaftar`}>
        {words?.map(({ word }) => (
          <li key={word}>
            <form action={removeBlockedWord} className="flex items-center gap-1 rounded-full bg-alabaster py-1 pl-3 pr-1 text-small">
              <span>{word}</span>
              <input type="hidden" name="word" value={word} />
              <SubmitButton className="grid size-7 place-items-center rounded-full text-ink-muted hover:bg-rose-100 hover:text-burgundy">
                <span aria-hidden="true">×</span>
                <span className="sr-only">Hapus {word}</span>
              </SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
