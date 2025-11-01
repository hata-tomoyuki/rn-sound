import { useFocusEffect } from '@react-navigation/native'
import { useAudioPlayer } from 'expo-audio'
// expo-audio: 画面ごとに「軽量なプレイヤー」を作れるフック。
// ・音源のURL/requireを渡すだけで、再生/停止/シーク/ループ設定が簡単に行えます。
// ・AVの低レベルAPI（expo-av）よりも扱いやすく、UIコードからの制御に向いています。
import React, { useCallback } from 'react'
import { Text, View } from 'react-native'

// 再生したいBGM（アセット）をrequireで指定します。
// requireを使うと、Metroバンドラーがファイルをビルドに含めてくれます。
const bgmSource = require('@/assets/sounds/bgm.mp3')

export const Game = () => {
  // プレイヤーを作成します。コンポーネントのライフサイクルに紐づきます。
  // playerには play()/pause()/seekTo()/loop のプロパティがあり即時に制御できます。
  const player = useAudioPlayer(bgmSource)

  useFocusEffect(
    useCallback(() => {
      // useFocusEffect: タブ遷移などで「画面が見えている/いない」を検知するためのフック。
      // React Navigationの画面はタブではアンマウントされないことが多いため、
      // マウント/アンマウントではなく「フォーカス時に再生、ブラー時に停止」するのが実用的です。
      // 画面がフォーカスされた時にBGMを最初から再生
      console.log("Game画面がフォーカスされました。BGMを最初から再生します。")

      // 再生位置を0にリセット（毎回冒頭から流したい場合）
      player.seekTo(0)

      // ループ再生を有効化（BGM向け設定）
      player.loop = true

      // BGMを再生
      player.play()

      // クリーンアップ：画面がフォーカスを失った時にBGMを停止。
      // アンマウントされなくても確実に止まります。
      return () => {
        console.log("Game画面を離れます。BGMを停止します。")
        player.pause()
      }
    }, [player])
  )

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>game</Text>
    </View>
  )
}

export default Game
