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

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($workspaceName, $userName)
    {
        $this->workspaceName = $workspaceName;
        $this->userName = $userName;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Bạn đã được thêm vào không gian làm việc')
            ->view('emails.workspace_invitation')
            ->with([
                'workspaceName' => $this->workspaceName,
                'userName' => $this->userName,
            ]);
    }
}
