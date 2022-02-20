# AWSの開発でたまに遭うエラーと原因

また遭遇しそうなやつを記録するやつです。環境はAWS Lambda, Node.js 14.xでSDKはv3を使っています。npmパッケージはバンドルせずLayerに入れて`import` (`require`)しています。

- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)
- [Lambda レイヤーの作成と共有](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/configuration-layers.html)

## crypto.getRandomValues() not supported

原因から察するにたぶんSQSに限りませんがSQSでSendMessageBatchしようとしたらでたエラーです。

```text
Error: crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported
    at rng (/var/task/index.js:7175:13)
    at v4 (/var/task/index.js:7209:52)
    at StandardRetryStrategy2.<anonymous> (/var/task/index.js:7327:55)
    at step (/var/task/index.js:226:25)
    at Object.next (/var/task/index.js:173:20)
    at fulfilled (/var/task/index.js:144:30)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
```

エラーは[src/rng-browser](https://github.com/uuidjs/uuid/blob/16e9cc9017663a24588c4925bb3e63ae624ad1d4/src/rng-browser.js#L22-L24)から出ています。リンク先にはReactNativeの対処とかしかなくて困りました。原因は[@aws-sdk/client-sqs](https://www.npmjs.com/package/@aws-sdk/client-sqs)をLayerに入れ忘れていたからでした。入れ忘れたのに`require()`ではエラーになりませんでした。入ってないなら`require()`の時点で「パッケージないよ」のエラーを出してほしい……

## The expected type comes from property A which is declared here on type B

aws-cdkのコードで出たTypeScriptのエラーです。例えばcoreのDurationで下のようなエラーが出ます。

```text
Type 'import("A").Duration' is not assignable to type 'import("B").Duration'.
Types have separate declarations of a private property 'amount'.
```

何度か遭遇しましたが、たいてい別の`@aws-cdk/aws-???`を入れた後に出ます。aws-cdkのパッケージたちのバージョンが揃っていないのが原因で、全部アップグレードするなどしてバージョンを揃えれば出なくなります。現状だとaws-cdkが週1回以上で更新されているので開発中に新しいパッケージを導入するときはだいたいずれます。

今回はここまで。
