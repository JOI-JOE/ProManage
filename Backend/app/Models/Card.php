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

    // /**
    //  * Tùy chỉnh mô tả log hoạt động.
    //  */

    // public function tapActivity(Activity $activity, string $eventName,)
    // //      $activity: Đối tượng Activity, chứa dữ liệu log.
    // // $eventName: Chuỗi mô tả sự kiện, như created, updated, deleted, restored
    // {
    //     $memberName = $activity->properties['member_name'] ?? '';

    //     $activity->description = $this->getCustomDescription($eventName, $memberName); // lấy mô tả chi tiết về sự kiện
    //     $activity->properties = [
    //         'old' => $activity->changes['old'] ?? [], // giá trị cũ
    //         'new' => $activity->changes['attributes'] ?? [], // giá trị mới
    //     ];
    // }
    // public function getCustomDescription(string $eventName, string $memberName = ""): string
    // {
    //     $user = optional(auth()->user())->user_name ?? 'Ai đó';

    //     switch ($eventName) {
    //         case 'created':
    //             return "$user đã tạo thẻ '{$this->title}'.";
    //         case 'updated_name':
    //             return "$user đã cập nhật tên thẻ thành '{$this->title}'.";
    //         case 'updated_description':
    //             return "$user đã cập nhật mô tả của thẻ '{$this->title}'.";
    //         case 'updated_datetime':
    //             $startDate = $this->start_date ?? 'chưa xác định';
    //             $endDate = $this->end_date ?? 'chưa xác định';
    //             $endTime = $this->end_time ?? 'chưa xác định';
    //             return "$user đã cập nhật ngày bắt đầu: '$startDate', ngày kết thúc: '$endDate', giờ kết thúc: '$endTime' cho thẻ '{$this->title}'.";
    //         case 'deleted':
    //             return "$user đã xóa thẻ '{$this->title}'.";
    //         case 'restored':
    //             return "$user đã khôi phục thẻ '{$this->title}'.";
    //         case 'added_member':
    //             return "$user đã thêm '$memberName' vào thẻ '{$this->title}'.";
    //         case 'removed_member':
    //             return "$user đã xóa '$memberName' khỏi thẻ '{$this->title}'.";
    //         default:
    //             return "$user đã $eventName thẻ '{$this->title}'.";
    //     }
    // }

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
    
}
