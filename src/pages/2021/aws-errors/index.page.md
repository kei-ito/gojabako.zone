# AWSの開発で見たエラーと原因

なんかまた遭遇しそうなやつを記録するやつです。前提として環境はAWS Lambda, Node.js 14.xでSDKはv3を使っています。また、外部パッケージはLayerに入れて使っています。

[AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)

## crypto.getRandomValues() not supported

原因から察するにたぶんSQSに限らないけどSQSでSendMessageBatchしようとしたらでたエラーです。

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

リンク先にはReactNativeの対処とかしかなくて困りました。エラーは[src/rng-browser](https://github.com/uuidjs/uuid/blob/16e9cc9017663a24588c4925bb3e63ae624ad1d4/src/rng-browser.js#L22-L24)から出ています。原因は[@aws-sdk/client-sqs](https://www.npmjs.com/package/@aws-sdk/client-sqs)をLayerに入れ忘れていたからでした。入ってないなら「パッケージないよ」のエラーを出してほしい……。

## The expected type comes from property A which is declared here on type B

aws-cdkのコードで出たTypeScriptのエラーです。例えばcoreのDurationで下のようなエラーが出ます。

```text
Type 'import("A").Duration' is not assignable to type 'import("B").Duration'.
Types have separate declarations of a private property 'amount'.
```

何度か遭遇していますが、たいてい別の`@aws-cdk/aws-???`を入れた後に出ます。aws-cdkのパッケージたちのバージョンが揃っていないのが原因ですので揃えれば直ります。aws-cdkの更新が週に1回以上のペースであるので開発中に新しいパッケージを導入するときはだいたいずれます。

今回はここまで。
