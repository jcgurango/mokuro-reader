<script lang="ts">
  import { browser } from '$app/environment';
  import { totalStats, volumes } from '$lib/settings';
  import { promptConfirmation, showSnackbar } from '$lib/util';
  import { AccordionItem, Button, Input, Label } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  let syncId: string = '';

  function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  onMount(() => {
    console.log(localStorage.getItem('syncId'));
    syncId = localStorage.getItem('syncId') || makeid(12);
  });

  async function onUploadVolumeData() {
    try {
      showSnackbar('Uploading volume data....', 0);
      await fetch('/volume-data/' + syncId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: localStorage.getItem('volumes') || '{}'
      });
      showSnackbar('Volume data uploaded');
    } catch (err) {
      showSnackbar('Error: ' + (err as any).message);
    }
  }

  async function onDownloadVolumeData() {
    try {
      showSnackbar('Downloading volume data....', 0);
      const response = await fetch('/volume-data/' + syncId);
      const downloaded = await response.json();

      volumes.update((prev) => ({
        ...prev,
        ...downloaded
      }));

      showSnackbar('Volume data downloaded');
    } catch (err) {
      showSnackbar('Error: ' + (err as any).message);
    }
  }

  $: if (browser && syncId) {
    localStorage.setItem('syncId', syncId);
  }
</script>

<AccordionItem>
  <span slot="header">Stats</span>
  <div>
    <p>Completed volumes: {$totalStats?.completed || 0}</p>
    <p>Pages read: {$totalStats?.pagesRead || 0}</p>
    <p>Characters read: {$totalStats?.charsRead || 0}</p>
    <p>Minutes read: {$totalStats?.minutesRead || 0}</p>
  </div>
  <form>
    <div>
      <Label for="sync_id" class="mb-2">Sync ID (Used for syncing w/ the server)</Label>
      <Input type="text" id="sync_id" placeholder="Any string" bind:value={syncId} required />
    </div>
    <div class="flex-col gap-2-flex">
      <Button
        color="dark"
        on:click={() => promptConfirmation('Upload volume data?', onUploadVolumeData)}
      >
        Upload volume data
      </Button>
      <Button
        color="alternative"
        on:click={() =>
          promptConfirmation('Download and overwrite volume data?', onDownloadVolumeData)}
      >
        Download volume data
      </Button>
    </div>
  </form>
</AccordionItem>
