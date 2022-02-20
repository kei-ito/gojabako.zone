# 加重平均の誤差伝播

https://maxi.wemo.me/ を更新していたのですがビンまとめの式のよい参照先が見つからなかったためここで導出します。

## 別々に精度をもつ測定結果をまとめた量

ある量$$x$$の測定結果が$$N$$回分あり、それぞれの測定の精度（分散）$$\sigma^{2}$$が得られているとします。

\begin{align}
x_{1}, x_{2}, ..., x_{N}\quad
\sigma_{x_{1}^{2}}, \sigma_{x_{2}^{2}}, ..., \sigma_{x_{N}^{2}}
\end{align}

$$x_{i}$$の加重平均 $$u$$ がほしいとします。

\begin{align}
u&=\frac{\sum_{i=1}^{N}a_{i}x_{i}}{\sum_{i=1}^{N}a_{i}}
\end{align}

このとき$$u$$の誤差（分散）が最小になる$$a_{i}$$を導出します。

まず、ある$$a_{i}$$の組み合わせで$$\sigma_{u}^{2}$$が最小になっているなら、そこから$$a_{i}$$の値がずれると$$\sigma_{u}^{2}$$は大きくなります。これは$$\sigma_{u}^{2}$$がその$$a_{i}$$の組み合わせで極値をとっているということです。

\begin{align}
\forall i \in \{1, 2, ..., N\}: \frac{\partial\sigma_{u}^{2}}{\partial a_{i}}&=0
\end{align}

次に、$$u$$の誤差伝播の式は次のようになります。

\begin{align}
\sigma_{u}^{2}&=\sum_{i=1}^{N}\left(\frac{\partial u}{\partial x_{i}}\right)^{2}\sigma_{x_{i}}^{2}
\end{align}

$$u$$の微分は$$(2)$$を使って計算できます。

\begin{align}
\frac{\partial u}{\partial x_{i}}
&\overset{(2)}{=}\frac{\partial}{\partial x_{i}}\frac{\sum_{j=1}^{N}a_{j}x_{j}}{\sum_{j=1}^{N}a_{j}}\\
&=\frac{a_{i}}{\sum_{j=1}^{N}a_{j}}
\end{align}

すると$$(4)$$は次のようになります。

\begin{align}
\sigma_{u}^{2}
&=\sum_{i=1}^{N}\left(\frac{\partial u}{\partial x_{i}}\right)^{2}\sigma_{x_{i}}^{2}
\overset{(6)}{=}\frac{\sum_{i=1}^{N}a_{i}^{2}\sigma_{x_{i}}^{2}}{\left(\sum_{i=1}^{N}a_{i}\right)^{2}}
\end{align}

これを極値の条件$$(3)$$に代入します。

\begin{align}
\frac{\partial}{\partial a_{i}}\frac{\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}}{\left(\sum_{j=1}^{N}a_{j}\right)^{2}}&=0\\
\frac{\partial}{\partial a_{i}}\left(\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}\right)\!\left(\sum_{j=1}^{N}a_{j}\right)^{-2}&=0
\end{align}

このまま計算すると横幅が足りないので以下の$$f, g$$を定義します。

\begin{align}
f(a_{1},a_{2},...,a_{N})&=\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}\\
g(a_{1},a_{2},...,a_{N})&=\left(\sum_{j=1}^{N}a_{j}\right)^{-2}
\end{align}

それぞれ微分を計算します。

\begin{align}
\frac{\partial f}{\partial a_{i}}
&=\frac{\partial}{\partial a_{i}}\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}\\
&=2a_{i}\sigma_{x_{i}}^{2}\\
\frac{\partial g}{\partial a_{i}}
&=\frac{\partial}{\partial a_{i}}\left(\sum_{j=1}^{N}a_{j}\right)^{-2}\\
&=-2\left(\sum_{j=1}^{N}a_{j}\right)^{-3}\frac{\partial}{\partial a_{i}}\sum_{j=1}^{N}a_{j}\\
&=-2\left(\sum_{j=1}^{N}a_{j}\right)^{-3}
\end{align}

$$(9)$$の続きを計算します。

\begin{align}
\frac{\partial}{\partial a_{i}}f\cdot g&=0\\
\left(\frac{\partial f}{\partial a_{i}}\right)g
+f\left(\frac{\partial g}{\partial a_{i}}\right)&=0\\
\left(2a_{i}\sigma_{x_{i}}^{2}\right)\left(\sum_{j=1}^{N}a_{j}\right)^{-2}
\!\!\!\!-2\left(\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}\right)\left(\sum_{j=1}^{N}a_{j}\right)^{-3}&=0\\
2\left(\sum_{j=1}^{N}a_{j}\right)^{-3}\left(a_{i}\sigma_{x_{i}}^{2}\sum_{j=1}^{N}a_{j}
-\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}\right)&=0\\
a_{i}\sigma_{x_{i}}^{2}\sum_{j=1}^{N}a_{j}-\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}&=0
\end{align}

$$(21)$$を$$a_{i}$$について整理します。

\begin{align}
a_{i}&=\frac{1}{\sigma_{x_{i}}^{2}}\frac{\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}}{\sum_{j=1}^{N}a_{j}}
\end{align}

両辺を$$i=1,2,...,N$$について足し、$$\textstyle\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}$$について整理します。

\begin{align}
\sum_{i=1}^{N}a_{i}&=\sum_{i=1}^{N}\frac{1}{\sigma_{x_{i}}^{2}}\frac{\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}}{\sum_{j=1}^{N}a_{j}}\\
\sum_{j=1}^{N}a_{j}^{2}\sigma_{x_{j}}^{2}&=\left(\sum_{j=1}^{N}a_{j}\right)^{2}\left(\sum_{j=1}^{N}\frac{1}{\sigma_{x_{j}}^{2}}\right)^{-1}
\end{align}

$$(24)$$を$$(22)$$に代入します。

\begin{align}
a_{i}&\overset{(24)}{=}\frac{1}{\sigma_{x_{i}}^{2}}\left(\sum_{j=1}^{N}a_{j}\right)\left(\sum_{j=1}^{N}\frac{1}{\sigma_{x_{j}}^{2}}\right)^{-1}
\end{align}

$$(24)$$を$$(7)$$に代入します。

\begin{align}
\sigma_{u}^{2}
&=\frac{\sum_{i=1}^{N}a_{i}^{2}\sigma_{x_{i}}^{2}}{\left(\sum_{i=1}^{N}a_{i}\right)^{2}}
\overset{(24)}{=}\left(\sum_{j=1}^{N}\frac{1}{\sigma_{x_{j}}^{2}}\right)^{-1}
\end{align}

## 結論

ある量$$x$$の複数回の測定結果$$x_{i}$$とその分散$$\sigma_{x_{i}}^{2}$$が得られており、その加重平均

\begin{align}
u&=\frac{\sum_{i=1}^{N}a_{i}x_{i}}{\sum_{i=1}^{N}a_{i}}
\end{align}

の誤差（分散）が最小になる$$a_{i}$$とそのときの分散$$\sigma_{u}^{2}$$は次の式で表されます。

\begin{align}
a_{i}&=\frac{1}{\sigma_{x_{i}}^{2}}\left(\sum_{j=1}^{N}a_{j}\right)\left(\sum_{j=1}^{N}\frac{1}{\sigma_{x_{j}}^{2}}\right)^{-1}\\
\sigma_{u}^{2}
&=\left(\sum_{j=1}^{N}\frac{1}{\sigma_{x_{j}}^{2}}\right)^{-1}
\end{align}
