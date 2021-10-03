markdownテストページ
=================

ここはmarkdownの表示テストのページです。ここはmarkdownの表示テストのページです。ここはmarkdownの表示テストのページです。

Headings
-----------------

これはh2の見出し
-----------------

これはh2の見出しの次の本文です。Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### これはh3の見出し

これはh3の見出しの次の本文です。Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Footnote
--------

Lorem ipsum dolor sit amet[^1], consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi[^2] ut[^3] aliquip ex ea commodo consequat.

[^1]: これはfootnoteの1つ目 consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
[^2]: これはfootnoteの2つ目
[^3]: これはfootnoteの3つ目 consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Code block
----------

### without caption

```diff
- const message = `修正${'前'}`;
+ const message = `修正${'後'}`;
```

### with caption

```typescript example.ts
const fooooooooooooooooooooooooooooooooo = 'baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaar';
const f000000000000000000000000000000000 = 'baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaar';
const fOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO = 'baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaar';
```

### with linked caption

```typescript [example.ts](https://example.com)
const foo = 'bar';
```

Decoration
----------

*強調*と**太字**と~~打ち消し線~~と[リンク](https://example.com)。

~~打ち消しと*強調*~~ **太字と~~打ち消し線~~** [リンクと**太字**](https://example.com)。

Ruby
----

<ruby>明日<rp>(</rp><rt>あした</rt><rp>)</rp></ruby>の話。

Autolink literals
-----------------

www.example.com, https://example.com, and contact@example.com.

Table
-----

| aaaaa | bbbbb | ccccc | dddddd |
| - | :- | -: | :-: |
| a | b  |  c |  d  |
| a | b  |  c |  d  |
| 校長の云うようにはとても出来ない。 | 校長の云うようにはとても出来ない。 | 校長の云うようにはとても出来ない。 |  d  |

| aaaaa | bbbbb | ccccc | dddddd |
| - | :- | -: | :-: |
| a | b  |  c |  d  |
| a | b  |  c |  d  |
| a | b  |  c |  d  |

Checkbox
--------

* [ ] Item1
* [x] Item2

- [ ] Item3
- [x] Item4

1. [ ] Item5
1. [x] Item6

Blockquote
----------

> 校長の云うようにはとても出来ない。おれみたような無鉄砲なものをつらまえて、生徒の模範になれの、一校の師表と仰がれなくてはいかんの、学問以外に個人の徳化を及ぼさなくては教育者になれないの、と無暗に法外な注文をする。そんなえらい人が月給四十円で遥々こんな田舎へくるもんか。人間は大概似たもんだ。
> > Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Image
-----

![ここはキャプション](../../public/logo.png)

-------------

List
----

- Item1
- Item2
- 校長の云うようにはとても出来ない。おれみたような無鉄砲なものをつらまえて、生徒の模範になれの、一校の師表と仰がれなくてはいかんの、学問以外に個人の徳化を及ぼさなくては教育者になれないの、と無暗に法外な注文をする。そんなえらい人が月給四十円で遥々こんな田舎へくるもんか。人間は大概似たもんだ。腹が立てば喧嘩の一つぐらいは誰でもするだろうと思ってたが、この様子じゃめったに口も聞けない、散歩も出来ない。
- Item4

1. Item1
1. Item2
1. 校長の云うようにはとても出来ない。おれみたような無鉄砲なものをつらまえて、生徒の模範になれの、一校の師表と仰がれなくてはいかんの、学問以外に個人の徳化を及ぼさなくては教育者になれないの、と無暗に法外な注文をする。そんなえらい人が月給四十円で遥々こんな田舎へくるもんか。人間は大概似たもんだ。腹が立てば喧嘩の一つぐらいは誰でもするだろうと思ってたが、この様子じゃめったに口も聞けない、散歩も出来ない。
1. Item4
