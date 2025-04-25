<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $workspaceName;
    public $userName;
    public $messageContent;

    public $link;

    public function __construct($workspaceName, $userName, $messageContent = null, $link)
    {
        $this->workspaceName = $workspaceName;
        $this->userName = $userName;
        $this->messageContent = $messageContent;
        $this->link = $link;
    }
    /**
     * Build the message.
    *
     * @return $this
     */
    public function build()
    {
        return $this->subject(subject: 'Bạn đã được thêm vào không gian làm việc')
            ->view('emails.invite')
            ->with([
                'workspaceName' => $this->workspaceName,
                'userName' => $this->userName,
                'messageContent' => $this->messageContent,
                'invite_link' => $this->link
            ]);
    }
}
