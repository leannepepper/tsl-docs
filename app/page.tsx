import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>TSL API</h1>

      <h2>NodeMaterials</h2>
      <p>
        <Link href="/api/node-materials">Browse NodeMaterials</Link>
      </p>

      <h2>TSL (nodes) — repo hierarchy</h2>
      <ul>
        <li>
          <Link href="/api/tsl/constants">constants</Link>
        </li>
        <li>
          <Link href="/api/tsl/core">core</Link>
        </li>
        <li>
          <Link href="/api/tsl/utils">utils</Link>
        </li>
        <li>
          <Link href="/api/tsl/math">math</Link>
        </li>
        <li>
          <Link href="/api/tsl/accessors">accessors</Link>
        </li>
        <li>
          <Link href="/api/tsl/display">display</Link>
        </li>
        <li>
          <Link href="/api/tsl/code">code</Link>
        </li>
        <li>
          <Link href="/api/tsl/geometry">geometry</Link>
        </li>
        <li>
          <Link href="/api/tsl/gpgpu">gpgpu</Link>
        </li>
        <li>
          <Link href="/api/tsl/lighting">lighting</Link>
        </li>
        <li>
          <Link href="/api/tsl/pmrem">pmrem</Link>
        </li>
        <li>
          <Link href="/api/tsl/parsers">parsers</Link>
        </li>
        <li>
          <Link href="/api/tsl/lighting-models">lighting models</Link>
        </li>
      </ul>
      <h2>TSL Root Exports</h2>
      <p>
        <Link href="/api/tsl">Show TSL.js exports</Link>
      </p>
    </main>
  );
}
