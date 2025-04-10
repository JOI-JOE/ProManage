@props(['url'])

<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block; text-decoration: none; font-weight: bold; font-size: 18px;">
            {{ $slot }}
        </a>
    </td>
</tr>

