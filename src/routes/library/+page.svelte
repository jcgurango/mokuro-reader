<script lang="ts">
  import { Search } from 'flowbite-svelte';
  import { db } from '$lib/catalog/db';
  import type { Manga } from '$lib/types';
  import { requestPersistentStorage, showSnackbar } from '$lib/util';
  import { onMount } from 'svelte';
  import { processFiles } from '$lib/upload';
  export let data;

  let search = '';
  let mangas: Manga[] = data.manga;

  async function recheckCatalog() {
    await requestPersistentStorage();
    const existingCatalog = await db.catalog.bulkGet(data.manga.map((manga) => manga.id));
    mangas = data.manga.filter(
      ({ id }) => !existingCatalog.find((existing) => existing?.id === id)
    );
  }

  async function downloadManga(filename: string) {
    showSnackbar('Downloading ' + filename + '...', 0);
    const response = await fetch('/library/' + filename);

    if (!response.ok) {
      showSnackbar(`Fetch error: ${response.status} ${response.statusText}`);
      return;
    }

    const contentLength = +(response.headers.get('Content-Length') || 0);
    const reader = response.body?.getReader();

    if (reader) {
      let receivedBytes = 0;
      const chunks = []; // we’ll accumulate binary chunks here

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // finished
          break;
        }
        // `value` is a Uint8Array of chunk bytes
        chunks.push(value);

        receivedBytes += value.length;
        if (contentLength) {
          showSnackbar('Progress: ' + Math.round((receivedBytes / contentLength) * 100) + '%', 0);
        }
      }

      const blob = new Blob(chunks, { type: 'application/zip' });
      const file = new File([blob], filename);

      showSnackbar('Processing...', 0);
      await processFiles([file]);
      showSnackbar('Done!', 0);
      await recheckCatalog();
    } else {
      showSnackbar('Could not create reader.');
    }
  }

  onMount(() => {
    recheckCatalog();
  });

  $: filteredMangas = search?.length
    ? mangas.filter(({ title }) => title.toLowerCase().includes(search.toLowerCase()))
    : mangas;
</script>

<svelte:head>
  <title>Library</title>
</svelte:head>

<div class="p-2 h-[90svh]">
  <div class="flex flex-col gap-5">
    <div class="flex gap-1 py-2">
      <Search bind:value={search} />
    </div>
    <div class="flex sm:flex-row flex-col gap-5 flex-wrap justify-center sm:justify-start">
      {#each filteredMangas as manga}
        <a href={'#'} on:click={() => downloadManga(manga.filename)}>
          <div
            class="flex flex-col gap-[5px] text-center items-center bg-slate-900 pb-1 bg-opacity-50 border border-slate-950"
          >
            <img
              src={'/library/' + manga.filename + '/cover'}
              alt="img"
              class="object-contain sm:w-[250px] sm:h-[350px] bg-black border-gray-900 border"
            />
            <p class="font-semibold sm:w-[250px] line-clamp-1">
              {manga.title}
            </p>
          </div>
        </a>
      {/each}
    </div>
    {#if !filteredMangas.length}
      {#if search.length}
        <div class="text-center p-20">
          <p>No results found.</p>
        </div>
      {:else}
        <div class="text-center p-20">
          <p>Nothing to see here!</p>
        </div>
      {/if}
    {/if}
  </div>
</div>
