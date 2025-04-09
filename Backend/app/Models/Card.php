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
    use HasFactory;

    protected $primaryKey = 'id'; // Đặt UUID làm khóa chính
    public $incrementing = false; // Vô hiệu hóa tự động tăng ID
    protected $keyType = 'string'; // Định dạng khóa chính là chuỗi

    protected $fillable = [
        'id',
        'title',
        'description',
        'thumbnail',
        'position',
        'start_date',
        'end_date',
        'end_time',
        'is_completed',
        'is_archived',
        'list_board_id',
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
            ->logOnlyDirty() // chỉ ghi log khi thay đổi thực sự dữ liệu VD:Thẻ A ->Thẻ A thì sẽ không ghi log
            ->logOnly(['title', 'description', 'start_date', 'end_date', 'end_time', 'position',]) // chỉ ghi log của những trường này
            ->setDescriptionForEvent(fn(string $eventName) => $this->getCustomDescription($eventName))
            //Khi một sự kiện xảy ra (created, updated, deleted, restored...),
            //  Spatie sẽ gọi phương thức getCustomDescription($eventName)
            //getCustomDescription là hàm mô tả thông tin hoạt động
            ->useLogName('card') // model card
            ->dontSubmitEmptyLogs(); //Ngăn chặn việc ghi log nếu không có sự thay đổi dữ liệu thực sự
    }

    public function listBoard()
    {
        return $this->belongsTo(ListBoard::class, 'list_board_id');
    }


   /////  Quốc đã sửa tên function này từ members thành users để lầm được đính kèm(chiều ngày 18/3)
    public function users()
    {
        return $this->belongsToMany(User::class, 'card_user');
    }
    public function members()
    {
        return $this->belongsToMany(User::class, 'card_user');
    }
    public function list()
    {
        return $this->belongsTo(ListBoard::class, 'list_board_id');
    }
    public function labels()
    {
        return $this->belongsToMany(Label::class, 'card_label', 'card_id', 'label_id');
    }

    public function comments()
    {
        return $this->hasMany(CommentCard::class);  // Mỗi card có nhiều bình luận
    }

    public function checklists()
    {
        return $this->hasMany(CheckList::class, 'card_id');
    }
    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class, 'card_id');
    }
}
