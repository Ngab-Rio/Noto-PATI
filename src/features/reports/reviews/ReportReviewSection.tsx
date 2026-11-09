"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitReportReview } from "@/features/reports/reviews/actions";
import type { ReportReviewSummary } from "@/lib/reports/reviews";

interface ReportReviewSectionProps {
  reportId: string;
  isAuthenticated: boolean;
  summary: ReportReviewSummary;
}

const MAX_COMMENT_LENGTH = 1000;

export function ReportReviewSection({
  reportId,
  isAuthenticated,
  summary,
}: ReportReviewSectionProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginUrl = `/login?next=${encodeURIComponent(`/reports/${reportId}`)}`;
  const hasReviewed = summary.viewerHasReviewed || hasSubmitted;
  const formattedAverage = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(summary.averageRating);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !summary.canReview || !rating || !comment.trim()) return;

    setErrorMessage(null);
    setIsPending(true);

    try {
      const result = await submitReportReview({ reportId, rating, comment });
      if (!result.ok) {
        if (result.reason === "already_submitted") {
          setHasSubmitted(true);
          router.refresh();
          return;
        }
        setErrorMessage(result.message);
        if (result.reason === "unauthenticated") {
          router.push(loginUrl);
        }
        return;
      }

      setHasSubmitted(true);
      setRating(0);
      setComment("");
      router.refresh();
    } catch (error) {
      console.error("Failed to submit report review", error);
      setErrorMessage("Penilaian gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section
      className="space-y-5 rounded-xl border border-border bg-surface p-4 sm:p-5"
      aria-labelledby="report-reviews-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="report-reviews-heading" className="text-lg font-semibold text-text">
            Penilaian warga
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Bagikan pengalaman Anda setelah laporan ini diselesaikan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text">
          <Star className="h-5 w-5 fill-current text-accent" aria-hidden="true" />
          <span className="font-semibold tabular-nums">{formattedAverage}</span>
          <span className="text-text-muted">
            dari {summary.reviewCount} penilaian
          </span>
        </div>
      </div>

      {summary.reviews.length > 0 ? (
        <ul className="divide-y divide-border border-y border-border">
          {summary.reviews.map((review, index) => (
            <li
              key={`${review.createdAt}-${index}`}
              className="space-y-2 py-4 first:pt-4 last:pb-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div
                  className="flex items-center gap-0.5 text-accent"
                  role="img"
                  aria-label={`Rating ${review.rating} dari 5`}
                >
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={`h-4 w-4 ${starIndex < review.rating ? "fill-current" : ""}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-text">
                  Warga{review.isViewer ? " · Ulasan Anda" : ""}
                </span>
                <time
                  className="text-xs text-text-muted"
                  dateTime={review.createdAt}
                >
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
                    new Date(review.createdAt),
                  )}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-y border-border py-4 text-sm text-text-muted">
          Belum ada penilaian untuk laporan ini.
        </p>
      )}

      {!isAuthenticated ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            Masuk sebagai warga untuk memberi rating dan komentar.
          </p>
          <Link
            href={loginUrl}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Masuk untuk menilai
          </Link>
        </div>
      ) : !summary.canReview ? (
        <p className="text-sm text-text-muted">
          Penilaian hanya tersedia untuk akun warga.
        </p>
      ) : hasReviewed ? (
        <p className="rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary-dark" role="status">
          Anda sudah mengirim penilaian untuk laporan ini.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-text">Rating Anda</legend>
            <div className="flex items-center gap-1" role="group" aria-label="Pilih rating 1 sampai 5">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                const selected = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} dari 5 bintang`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className="flex h-11 w-11 items-center justify-center rounded-md text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Star
                      className={`h-6 w-6 ${selected ? "fill-current" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-text-muted">
                {rating ? `${rating} dari 5` : "Pilih 1–5"}
              </span>
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="report-review-comment" className="text-sm font-medium text-text">
              Komentar
            </label>
            <textarea
              id="report-review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
              maxLength={MAX_COMMENT_LENGTH}
              rows={4}
              required
              placeholder="Ceritakan pengalaman Anda terhadap hasil penanganan laporan ini."
              className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-relaxed text-text placeholder:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
            />
            <div className="flex flex-wrap justify-between gap-2 text-xs text-text-muted">
              <span>Ulasan tampil untuk umum tanpa nama.</span>
              <span className="tabular-nums">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending || !rating || !comment.trim()}
            className="w-full sm:w-auto"
          >
            {isPending ? "Mengirim penilaian..." : "Kirim penilaian"}
          </Button>
          <p className="text-xs text-text-muted">
            Penilaian hanya dapat dikirim satu kali dan tidak dapat diubah.
          </p>
        </form>
      )}
    </section>
  );
}
