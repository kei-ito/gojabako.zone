# 加重平均の誤差伝播

https://maxi.wemo.me/ を更新していたのですがビンまとめの式のよい参照先が見つからなかったためここで導出します。

## 測定結果をまとめた量

ある量$$x$$の測定結果が$$N$$回分あり、それぞれの測定の精度（分散）$$\sigma^{2}$$が得られているとします。

\begin{align}
x*{1}, x*{2}, ..., x*{N}\quad
\sigma*{x*{1}}^{2}, \sigma*{x*{2}}^{2}, ..., \sigma*{x\_{N}}^{2}
\end{align}

$$x_{i}$$の加重平均 $$u$$ がほしいとします。

\begin{align}
u&=\frac{\sum*{i=1}^{N}a*{i}x*{i}}{\sum*{i=1}^{N}a\_{i}}
\end{align}

このとき$$u$$の誤差（分散）が最小になる$$a_{i}$$を導出します。

## 導出

まず、ある$$a_{i}$$の組み合わせで$$\sigma_{u}^{2}$$が最小になっているなら、そこから$$a_{i}$$の値がずれると$$\sigma_{u}^{2}$$は大きくなります。これは$$\sigma_{u}^{2}$$がその$$a_{i}$$の組み合わせで極値をとっているということです。

\begin{align}
\forall i \in \{1, 2, ..., N\}: \frac{\partial\sigma*{u}^{2}}{\partial a*{i}}&=0
\end{align}

次に、$$u$$の誤差伝播の式は次のようになります。

\begin{align}
\sigma*{u}^{2}&=\sum*{i=1}^{N}\left(\frac{\partial u}{\partial x*{i}}\right)^{2}\sigma*{x\_{i}}^{2}
\end{align}

$$u$$の微分は$$(2)$$を使って計算できます。

\begin{align}
\frac{\partial u}{\partial x*{i}}
&\overset{(2)}{=}\frac{\partial}{\partial x*{i}}\frac{\sum*{j=1}^{N}a*{j}x*{j}}{\sum*{j=1}^{N}a*{j}}\\
&=\frac{a*{i}}{\sum*{j=1}^{N}a*{j}}
\end{align}

すると$$(4)$$は次のようになります。

\begin{align}
\sigma*{u}^{2}
&=\sum*{i=1}^{N}\left(\frac{\partial u}{\partial x*{i}}\right)^{2}\sigma*{x*{i}}^{2}
\overset{(6)}{=}\frac{\sum*{i=1}^{N}a*{i}^{2}\sigma*{x*{i}}^{2}}{\left(\sum*{i=1}^{N}a\_{i}\right)^{2}}
\end{align}

これを極値の条件$$(3)$$に代入します。

\begin{align}
\frac{\partial}{\partial a*{i}}\frac{\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}}{\left(\sum*{j=1}^{N}a*{j}\right)^{2}}&=0\\
\frac{\partial}{\partial a*{i}}\left(\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}\right)\!\left(\sum*{j=1}^{N}a*{j}\right)^{-2}&=0
\end{align}

このまま計算すると横幅が足りないので以下の$$f, g$$を定義します。

\begin{align}
f(a*{1},a*{2},...,a*{N})&=\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}\\
g(a*{1},a*{2},...,a*{N})&=\left(\sum*{j=1}^{N}a*{j}\right)^{-2}
\end{align}

それぞれ微分を計算します。

\begin{align}
\frac{\partial f}{\partial a*{i}}
&=\frac{\partial}{\partial a*{i}}\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}\\
&=2a*{i}\sigma*{x*{i}}^{2}\\
\frac{\partial g}{\partial a*{i}}
&=\frac{\partial}{\partial a*{i}}\left(\sum*{j=1}^{N}a*{j}\right)^{-2}\\
&=-2\left(\sum*{j=1}^{N}a*{j}\right)^{-3}\frac{\partial}{\partial a*{i}}\sum*{j=1}^{N}a*{j}\\
&=-2\left(\sum*{j=1}^{N}a*{j}\right)^{-3}
\end{align}

$$(9)$$の続きを計算します。

\begin{align}
\frac{\partial}{\partial a*{i}}f\cdot g&=0\\
\left(\frac{\partial f}{\partial a*{i}}\right)g
+f\left(\frac{\partial g}{\partial a*{i}}\right)&=0\\
\left(2a*{i}\sigma*{x*{i}}^{2}\right)\left(\sum*{j=1}^{N}a*{j}\right)^{-2}
\!\!\!\!-2\left(\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}\right)\left(\sum*{j=1}^{N}a*{j}\right)^{-3}&=0\\
2\left(\sum*{j=1}^{N}a*{j}\right)^{-3}\left(a*{i}\sigma*{x*{i}}^{2}\sum*{j=1}^{N}a*{j}
-\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}\right)&=0\\
a*{i}\sigma*{x*{i}}^{2}\sum*{j=1}^{N}a*{j}-\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}&=0
\end{align}

$$(21)$$を$$a_{i}$$について整理します。

\begin{align}
a*{i}&=\frac{1}{\sigma*{x*{i}}^{2}}\frac{\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}}{\sum*{j=1}^{N}a\_{j}}
\end{align}

両辺を$$i=1,2,...,N$$について足し、$$\textstyle\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}$$について整理します。

\begin{align}
\sum*{i=1}^{N}a*{i}&=\sum*{i=1}^{N}\frac{1}{\sigma*{x*{i}}^{2}}\frac{\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}}{\sum*{j=1}^{N}a*{j}}\\
\sum*{j=1}^{N}a*{j}^{2}\sigma*{x*{j}}^{2}&=\left(\sum*{j=1}^{N}a*{j}\right)^{2}\left(\sum*{j=1}^{N}\frac{1}{\sigma*{x*{j}}^{2}}\right)^{-1}
\end{align}

$$(24)$$を$$(22)$$に代入します。

\begin{align}
a*{i}&\overset{(24)}{=}\frac{1}{\sigma*{x*{i}}^{2}}\left(\sum*{j=1}^{N}a*{j}\right)\left(\sum*{j=1}^{N}\frac{1}{\sigma*{x*{j}}^{2}}\right)^{-1}
\end{align}

$$(24)$$を$$(7)$$に代入します。

\begin{align}
\sigma*{u}^{2}
&=\frac{\sum*{i=1}^{N}a*{i}^{2}\sigma*{x*{i}}^{2}}{\left(\sum*{i=1}^{N}a*{i}\right)^{2}}
\overset{(24)}{=}\left(\sum*{j=1}^{N}\frac{1}{\sigma*{x*{j}}^{2}}\right)^{-1}
\end{align}

## 結論

ある量$$x$$の複数回の測定結果$$x_{i}$$とその分散$$\sigma_{x_{i}}^{2}$$が得られており、その加重平均

\begin{align}
u&=\frac{\sum*{i=1}^{N}a*{i}x*{i}}{\sum*{i=1}^{N}a\_{i}}
\end{align}

の誤差（分散）が最小になる$$a_{i}$$とそのときの分散$$\sigma_{u}^{2}$$は次の式で表されます。

\begin{align}
a*{i}&=\frac{1}{\sigma*{x*{i}}^{2}}\left(\sum*{j=1}^{N}a*{j}\right)\left(\sum*{j=1}^{N}\frac{1}{\sigma*{x*{j}}^{2}}\right)^{-1}\\
\sigma*{u}^{2}
&=\left(\sum*{j=1}^{N}\frac{1}{\sigma*{x*{j}}^{2}}\right)^{-1}
\end{align}
