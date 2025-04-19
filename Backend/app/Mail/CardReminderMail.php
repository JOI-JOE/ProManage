<?php

namespace App\Mail;

use App\Models\Card;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CardReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $card;
    public $type;

    public function __construct(Card $card, string $type = 'reminder')
    {
        $this->card = $card;
        $this->type = $type;
    }

    public function build()
    {
        $deadline = $this->formatDeadline();
        $message = $this->getMessage();

        return $this->subject("📌 Nhắc nhở {$this->type}: {$this->card->title}")
            ->markdown('emails.card-reminder')
            ->with([
                'card' => $this->card,
                'type' => $this->type,
                'deadline' => $deadline,
                'message' => $message,
                'url' => $this->getCardUrl(),
            ]);
    }

    private function formatDeadline()
    {
        $dateTime = null;

        switch ($this->type) {
            case 'start_date':
                $dateTime = $this->card->start_date;
                break;
            case 'end_date':
                $dateTime = $this->card->end_date ? \Carbon\Carbon::parse($this->card->end_date . ' ' . ($this->card->end_time ?? '00:00:00')) : null;
                break;
            case 'reminder':
                $dateTime = $this->card->reminder;
                break;
        }

        if (!$dateTime) {
            return "Không có hạn chót";
        }

        return \Carbon\Carbon::parse($dateTime)->format('d/m/Y H:i');
    }

    private function getMessage()
    {
        return match ($this->type) {
            'start_date' => 'Bắt đầu',
            'end_date' => 'Hạn chót',
            'reminder' => 'Nhắc nhở',
            default => 'Nhắc nhở',
        };
    }

    private function getCardUrl()
    {
        if (!$this->card->list || !$this->card->list->board) {
            return "http://localhost:5173/cards/{$this->card->id}";
        }

        return "http://localhost:5173/b/{$this->card->list->board->id}/{$this->card->list->board->name}/c/{$this->card->id}/" . urlencode($this->card->title);
    }
}
