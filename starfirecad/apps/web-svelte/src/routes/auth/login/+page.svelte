<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  let id = '';
  let password = '';
  let error = '';
  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    const res = await fetch(`${PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: id, password }),
      credentials: 'include'
    });
    if (!res.ok) error = 'Login failed';
    else window.location.href = '/';
  }
</script>

<h1 class="text-xl font-semibold mb-4">Login</h1>
<form on:submit|preventDefault={submit} class="space-y-3 max-w-sm">
  <input bind:value={id} placeholder="Email or Username" class="w-full p-2 border rounded" />
  <input bind:value={password} type="password" placeholder="Password" class="w-full p-2 border rounded" />
  {#if error}<div class="text-red-600 text-sm">{error}</div>{/if}
  <button class="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
</form>