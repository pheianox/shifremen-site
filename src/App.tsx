import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { TbBrandGithub, TbFile, TbMoon, TbSun } from 'solid-icons/tb'
import { Asset, Release } from "./types";
import axios from 'axios'

const App: Component = () => {
  const RELEASES_URL = 'https://api.github.com/repos/pheianox/shifremen/releases/latest'

  enum AssetNames {
    Windows = "Windows 10/11",
    MacOS = "MacOS",
    LinuxDebian = "Linux (Debian)",
    LinuxTarGz = "Linux (Archive)",
    LinuxAppImage = "Linux (AppImage)",
    Unknown = "(unknown)"
  } 

  const [release, setRelease] = createSignal<Release>()
  const [isLoading, setLoading] = createSignal(true)

  onMount(async () => {
    const response = await axios.get<Release>(RELEASES_URL)
    if (response.status == 200) {
      setRelease(response.data)
      console.log(release())
    } else {
      console.error('could not fetch latest release')
    }
    setLoading(false)
  })

  function resolveAssetName(name: string) {
    if (name.includes('.deb')) return AssetNames.LinuxDebian
    if (name.includes('.AppImage')) return AssetNames.LinuxAppImage
    if (name.includes('.tar.gz')) return AssetNames.LinuxTarGz
    if (name.includes('.dmg')) return AssetNames.MacOS
    if (name.includes('.msi')) return AssetNames.Windows
    return AssetNames.Unknown
  }

  const assetSortOrderMap = {
    [AssetNames.Windows]: -1,
    [AssetNames.MacOS]: -2,
    [AssetNames.LinuxDebian]: -3,
    [AssetNames.LinuxTarGz]: -4,
    [AssetNames.LinuxAppImage]: -5,
    [AssetNames.Unknown]: -6
  }

  function sortAssets(a: Asset, b: Asset) {
    return assetSortOrderMap[resolveAssetName(b.name)] - assetSortOrderMap[resolveAssetName(a.name)]
  }

  const RepositoryLink: Component<{ size: number }> = ({ size = 10 }) => {
    return (
      <a class="btn btn-ghost gap-2 btn-sm" href="https://github.com/pheianox/shifremen" target="_blank">
        <TbBrandGithub class={`w-${size} h-${size}`}/>
      </a>
    )
  }

  const DarkModeToggler: Component<{ size: number }> = ({ size = 10 }) => {
    const [isDark, setDark] = createSignal(false)
  
    createEffect(() => {
      console.log(isDark())
      document.documentElement.setAttribute('data-theme', isDark() ? 'dark' : 'light')
    })
  
    return (
      <label class="btn btn-ghost btn-sm swap swap-rotate" >
      <input type="checkbox" onchange={() => setDark(x => !x)}/>
      <TbSun class={`swap-on w-${size} h-${size}`}/>
      <TbMoon class={`swap-off w-${size} h-${size}`}/>
      </label>
    )
  }

  const AssetList: Component = () => {
    return (
      <div class="flex flex-col gap-2 w-full flex-wrap [&>:not(:last-child)]:border-b-2 border-accent">
        {release()?.assets.sort(sortAssets).map(asset => {
          const readableName = resolveAssetName(asset.name)
          const sizeInMb = Math.trunc(asset.size/1024**2)
          return (
            <div class="flex gap-10 justify-between text-left items-center p-2">
             
              <div class="flex gap-4">
                <div class="grid place-items-center">
                  <TbFile size={19}/>
                </div>
                {readableName}
              </div>
              <div class="flex gap-10 items-center">
                <div>{sizeInMb} MB</div>
                <a class="btn btn-ghost btn-xs" 
                  href={asset.browser_download_url} 
                  download={asset.name}
                >Download</a>
              </div>
            </div>
          )
        })}  
      </div>
    )
  }

  const Spinner: Component = () => {
    return (
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    )
  }

  return (
    <div class="h-screen w-screen relative hero grid place-items-center min-h-screen bg-base-200 select-none">
        <Show when={!isLoading()} fallback={<Spinner />}>
          <div class="hero-content text-center">
          <div class="max-w-md transition-all">
            <h1 class="text-5xl font-bold">Shifremen</h1>
            <p class="mt-5 mb-0 flex flex-col items-center gap-5">Secure Password Manager</p>
            <div class="flex justify-between items-center px-2 py-5">
              <span class="badge badge-sm">{release()?.tag_name}</span>
              <div class="flex gap-2 items-center">
                <DarkModeToggler size={4}/>
                <RepositoryLink size={4}/>
              </div>
            </div>
            <AssetList />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default App;
