<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Lời mời tham gia Promange</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    "
  >
    <table
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="600"
      style="border-collapse: collapse"
    >
      <tr>
        <td
          bgcolor="#ffffff"
          style="padding: 10px 30px; display: flex; align-items: center"
        >
          <img
            src="{{ asset('images/promanage.png') }}"
            width="50"
            style="display: inline-block; margin-right: 10px"
            alt="Promange"
          />
          <span style="font-weight: bold; font-size: 20px"> Promange </span>
        </td>
      </tr>
      <tr>
        <td bgcolor="#ffffff" style="padding: 30px 30px 40px 30px">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td
                style="
                  color: #153643;
                  font-size: 24px;
                  font-weight: bold;
                  text-align: left;
                  padding-bottom: 10px;
                "
              >
                {{-- {{ $inviter_name }} đã mời bạn tham gia Không gian làm việc "{{ $workspace_name }}" --}}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 10px 0 30px 0;
                  color: #153643;
                  font-size: 16px;
                  line-height: 20px;
                  text-align: left;
                "
              >
                Tham gia cùng họ trên Promange để cộng tác, quản lý dự án và đạt đỉnh năng suất mới.
              </td>
            </tr>
            <tr>
              <td align="left" style="padding-bottom: 20px">
                {{-- <a
                  href="{{ $invite_link }}"
                  style="
                    background-color: #0052cc;
                    color: #ffffff;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                  "
                >
                  Đi đến Không gian làm việc
                </a> --}}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 10px 0 0 0;
                  color: #153643;
                  font-size: 16px;
                  line-height: 20px;
                "
              >
                <strong>Promange là gì?</strong> Hãy tưởng tượng một chiếc bảng trắng, dán đầy danh sách công việc, mỗi công việc tương đương với một tác vụ. Bạn có thể theo dõi, cộng tác và đạt hiệu quả tối đa.
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 10px 0 0 0;
                  color: #153643;
                  font-size: 16px;
                  line-height: 20px;
                "
              >
                Hãy tham gia ngay để trải nghiệm Promange!
                <a href="URL_TÌM_HIỂU_THÊM" style="color: #0079bf">Tìm hiểu thêm</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td
          bgcolor="#f0f0f0"
          style="
            padding: 30px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            color: #42526e;
          "
        >
          Atlassian
        </td>
      </tr>
    </table>
  </body>
</html>
