# Flutter publication without Xcode (on your laptop)

Pick which “publication” you mean—they are unrelated.

## 1) Dart / Flutter packages on **pub.dev** (no Xcode, ever)

`dart pub publish` only needs Dart/Flutter SDK and a **[pub.dev site token](https://pub.dev/my-account#create-token)**—not Xcode.

**Local (no automation):**

```bash
dart pub publish --dry-run
dart pub publish
```

First time, `dart pub login` guides token setup.

**CI (GitHub Actions, Linux runners—no macOS):**

1. Pub.dev → **Account** → **Create token** → choose the token type their UI recommends for uploads / CI.
2. GitHub repo → **Settings → Secrets → Actions** → add secret **`PUB_TOKEN`** with that token.
3. Copy `github-actions-pub-publish.yml` into `.github/workflows/` in **each Flutter/Dart package repo** you publish (the checkout root—or set `PUB_PUBLISH_DIR` in the workflow—to the folder containing `pubspec.yaml`).
4. Push a semver tag **`v*`** aligned with **`version:`** in `pubspec.yaml`, or use **Workflow dispatch**.

The workflow relies on **`PUB_TOKEN`**; CI never needs Xcode.

## 2) Flutter **apps** to App Store / TestFlight (no Xcode on *your* machine)

Apple still requires **`xcodebuild` + signing somewhere**—use **hosted macOS**:

| Option | Notes |
|--------|--------|
| **GitHub Actions** `runs-on: macos-latest` | Xcode on the runner. Drive **`flutter build ipa`** or Fastlane with an **App Store Connect API key** (.p8) in secrets—not your Apple ID password. |
| **Codemagic / Bitrise** | Guided Flutter templates; often the fastest path without maintaining signing YAML yourself. |

You **do not** install Xcode locally; you store certificates, provisioning profile, and API key material as encrypted CI secrets.

Sketch:

1. App Store Connect → **Users and Access → Keys → App Store Connect API** → `.p8` + Issuer ID + Key ID → GitHub Secrets.
2. CI: **`flutter pub get`** → **`flutter build ipa`** (or Fastlane **deliver** / **pilot** for TestFlight).

If you primarily ship **libraries** (`pub.dev`), §1 alone is enough.

## Files here

| File | Use |
|------|-----|
| `github-actions-pub-publish.yml` | Drop into `.github/workflows/` of a **package** repo. |
| `github-actions-ios-flutter-stub.yml` | Skeleton for **`macos-latest`** + Flutter—finish with your ASC API + provisioning/certs strategy. |

The iOS file is deliberately incomplete until you attach signing secrets; **Codemagic’s Flutter preset** may be quicker if you want zero local Xcode **and** minimal CI setup.
