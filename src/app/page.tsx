import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
};

const text1 =
  '校長の云うようにはとても出来ない。おれみたような無鉄砲なものをつらまえて、生徒の模範になれの、一校の師表と仰がれなくてはいかんの、学問以外に個人の徳化を及ぼさなくては教育者になれないの、と無暗に法外な注文をする。そんなえらい人が月給四十円で遥々こんな田舎へくるもんか。人間は大概似たもんだ。腹が立てば喧嘩の一つぐらいは誰でもするだろうと思ってたが、この様子じゃめったに口も聞けない、散歩も出来ない。';
const text2 =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
export default function Page() {
  return (
    <article>
      <p>{text1}</p>
      <p>{text2}</p>
      <p>{text1}</p>
      <p>{text2}</p>
      <p>{text1}</p>
      <p>{text2}</p>
    </article>
  );
}
