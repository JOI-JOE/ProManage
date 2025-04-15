<?php

namespace App\Models;

use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\Contracts\Activity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Str;

class Card extends Model
{
    use HasFactory, LogsActivity;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'description',
        'thumbnail',
        'position',
        'start_date',
        'end_date',
        'end_time',
        'reminder',
        'is_completed',
        'is_archived',
        'list_board_id',
    ];

    protected $casts = [
        'position' => 'decimal:6',
        'is_completed' => 'boolean',
        'is_archived' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('default');
    }

    // Quan hệ với list_board
    public function list_board()
    {
        return $this->belongsTo(ListBoard::class, 'list_board_id');
    }

    // Quan hệ với users (thành viên được gán vào card)
    public function users()
    {
        return $this->belongsToMany(User::class, 'card_user', 'card_id', 'user_id')
            ->withPivot('assigned_at');
    }

    // Alias cho users
    public function members()
    {
        return $this->users();
    }

    // Quan hệ với labels
    public function labels()
    {
        return $this->belongsToMany(Label::class, 'card_label', 'card_id', 'label_id');
    }

    // Quan hệ với comments
    public function comments()
    {
        return $this->hasMany(CommentCard::class, 'card_id');
    }

    // Quan hệ với attachments
    public function attachments()
    {
        return $this->hasMany(Attachment::class, 'card_id');
    }

    // Quan hệ với board thông qua list_board
    public function board()
    {
        return $this->hasOneThrough(
            Board::class,
            ListBoard::class,
            'id', // Khóa ngoại của ListBoard
            'id', // Khóa chính của Board
            'list_board_id', // Khóa ngoại trong Card
            'board_id' // Khóa ngoại trong ListBoard
    );
    }

    public function checklists()
    {
        return $this->hasMany(Checklist::class, 'card_id');
    }

    public function getTotalChecklistItemsAttribute()
    {
        return $this->checklists()->withCount('checklist_items')->get()->sum('checklist_items_count');
    }

    public function getCompletedChecklistItemsAttribute()
    {
        return $this->checklists()
            ->withCount(['checklist_items' => function ($query) {
                $query->where('is_completed', true);
            }])
            ->get()
            ->sum('checklist_items_count');
    }

    // Accessor cho attachment_count
    public function getAttachmentCountAttribute()
    {
        return $this->attachments()->count();
    }

    // Accessor cho comment_count
    public function getCommentCountAttribute()
    {
        return $this->comments()->count();
    }
}
