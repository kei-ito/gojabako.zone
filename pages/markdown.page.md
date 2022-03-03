Markdown動作確認およびタイトルが長い場合の画像生成等の検証用記事
=================

ここはmarkdownの表示テストのページです。
*強調*と**太字**と~~打ち消し線~~と[リンク](https://example.com)。
~~打ち消しと*強調*~~ **太字と~~打ち消し線~~** [リンクと**太字**](https://example.com)。

Autolink literals
-----------------

www.example.com, https://example.com, and contact@example.com.

HTML
----

<ruby>明日<rp>(</rp><rt>あした</rt><rp>)</rp></ruby>の話

include TSX
-----------

```jsx (include)
import {Counter} from '../packages/components/site/Counter';
/****************/
<Counter/>
```

H2 Headings
-----------------

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

これはH2の見出し
-----------------

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### これはh3の見出し

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

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

TeX
---

\begin{align} Fourier変換
F(w)=\frac{1}{\sqrt{2\pi}} \int_{-\infty}^{\infty}dx f(x) e^{-iwx}
\end{align}

\begin{align}
y&=
\omega^{k}\sqrt[3]{
    -{\frac{q}{2}}
    +\sqrt{
        \left(\frac{q}{2}\right)^{2}
        +\left(\frac{p}{3}\right)^{3}
    }
}
+\omega^{3-k}\sqrt[3]{
    -\frac{q}{2}
    -\sqrt{
        \left(\frac{q}{2}\right)^{2}
        +\left(\frac{p}{3}\right)^{3}
    }
}
\ \ (k=0,1,2)
\end{align}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
文章中にも$$f(x)$$や$$\frac{1}{\sqrt{2\pi}}$$のように出せます。文章中にも$$f(x)$$や$$\frac{1}{\sqrt{2\pi}}$$のように出せます。
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

```markdown markdownソース
文章中にも$$f(x)$$や$$\frac{1}{\sqrt{2\pi}}$$のように出せます。
```

Blockquote
----------

> 校長の云うようにはとても出来ない。おれみたような無鉄砲なものをつらまえて、生徒の模範になれの、一校の師表と仰がれなくてはいかんの、学問以外に個人の徳化を及ぼさなくては教育者になれないの、と無暗に法外な注文をする。そんなえらい人が月給四十円で遥々こんな田舎へくるもんか。人間は大概似たもんだ。
> > Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Image
-----

![ここはキャプション](../public/logo.png)

-------------

List
----

- Item1
- Item2
- 校長の云うようにはとても出来ない。おれみたような無鉄砲なものをつらまえて、生徒の模範になれの、一校の師表と仰がれなくてはいかんの、学問以外に個人の徳化を及ぼさなくては教育者になれないの、と無暗に法外な注文をする。そんなえらい人が月給四十円で遥々こんな田舎へくるもんか。人間は大概似たもんだ。腹が立てば喧嘩の一つぐらいは誰でもするだろうと思ってたが、この様子じゃめったに口も聞けない、散歩も出来ない。
- Item4

1. Item1
1. Item2
1. 校長の云うようにはとても出来ない。おれみたような無鉄砲なものをつらまえて、生徒の模範になれの、一校の師表と仰がれなくてはいかんの、学問以外に個人の徳化を及ぼさなくては教育者になれないの、と無暗に法外な注文をする。
    1. SubItem1
    1. SubItem2
    1. そんなえらい人が月給四十円で遥々こんな田舎へくるもんか。人間は大概似たもんだ。腹が立てば喧嘩の一つぐらいは誰でもするだろうと思ってたが、この様子じゃめったに口も聞けない、散歩も出来ない。
1. Item4

YouTube
-------

```youtube
<iframe width="560" height="315" src="https://www.youtube.com/embed/5LI1PysAlkU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```

Twitter
-------

```twitter
<blockquote class="twitter-tweet"><p lang="ja" dir="ltr"><a href="https://t.co/l8969kKyb8">https://t.co/l8969kKyb8</a><br>天保十五甲辰新暦には「九時」がある。「くじ」って読んだのかな？<br>橋本万平著「日本の時刻制度 増補版」によるとこの「時」はいまの「時」とは違うけど、「時」一文字を単位に使う例としては今のところ最古 <a href="https://t.co/jGeg003vm8">pic.twitter.com/jGeg003vm8</a></p>&mdash; Kei Ito (@gjbkz) <a href="https://twitter.com/gjbkz/status/1330431107540471808?ref_src=twsrc%5Etfw">November 22, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```
