import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { TbBrandGithub } from 'solid-icons/tb'
import { Asset, Release } from "./types";
import axios from 'axios'


const App: Component = () => {
  const RELEASES_URL = 'https://api.github.com/repos/pheianox/shifremen/releases/latest'

  enum AssetNames {
    Windows = "Windows 10/11",
    MacOS = "MacOS",
    LinuxDebian = "Linux (Debian)",
    LinuxTarGz = "Linux (TAR GZ)",
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
      <svg class={`swap-on fill-current w-${size} h-${size}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
      <svg class="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
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
              <div>{readableName}</div>
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
    <div class="relative hero grid place-items-center min-h-screen bg-base-200 select-none">
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
