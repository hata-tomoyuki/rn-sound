import { useAudioPlayer } from 'expo-audio'
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'

const bgmSource = require('@/assets/sounds/bgm.mp3')

export const Game = () => {
  const player = useAudioPlayer(bgmSource)

  useEffect(() => {
    // 画面表示時にBGMを再生
    player.play()

    // ループ再生を有効化
    player.loop = true

    // クリーンアップ：画面を離れる時にBGMを停止
    return () => {
      player.pause()
    }
  }, [player])

  return (
    <View>
      <Text>game</Text>
    </View>
  )
}

export default Game
