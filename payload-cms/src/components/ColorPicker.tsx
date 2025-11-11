import React, { useEffect, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

type Props = {
	value?: string;
	onChange?: (v: string) => void;
	// optional preset palette — if not provided a sensible default will be used
	presets?: string[];
	// whether to show recent colors saved in localStorage
	showRecent?: boolean;
};

const RECENTS_KEY = 'payload:colorpicker:recents';

function readRecents(): string[] {
	try {
		const raw = localStorage.getItem(RECENTS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed.filter(Boolean).slice(0, 8);
		} catch (_e) {
			// ignore
		}
	return [];
}

function writeRecents(list: string[]) {
	try {
		localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, 8)));
		} catch (_e) {
			// ignore
		}
}

export default function ColorPicker({ value, onChange, presets, showRecent = true }: Props) {
	const defaultPresets = useMemo(
		() => [
			'#dc2626',
			'#2563eb',
			'#16a34a',
			'#eab308',
			'#9333ea',
			'#ea580c',
			'#ec4899',
			'#14b8a6',
			'#6b7280',
			'#000000',
		],
		[]
	);

	const palette = presets && presets.length ? presets : defaultPresets;

	const [color, setColor] = useState<string>(value || '#000000');
	const [open, setOpen] = useState(false);
	const [recents, setRecents] = useState<string[]>([]);

	useEffect(() => {
		if (showRecent) setRecents(readRecents());
	}, [showRecent]);

	useEffect(() => {
		setColor(value || '#000000');
	}, [value]);

		useEffect(() => {
			if (onChange) onChange(color);
		}, [color, onChange]);

	function choose(c: string) {
		setColor(c);
		// add to recents
		if (showRecent) {
			const next = [c, ...recents.filter((r) => r.toLowerCase() !== c.toLowerCase())].slice(0, 8);
			setRecents(next);
			writeRecents(next);
		}
	}

	return (
		<div className="color-picker" style={{ fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif' }}>
			<div className="preset-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
				{palette.map((p) => (
					<button
						key={p}
						aria-label={`Choose ${p}`}
						title={p}
						onClick={() => choose(p)}
						style={{
							width: 28,
							height: 28,
							borderRadius: 6,
							border: p.toLowerCase() === color.toLowerCase() ? '2px solid #111' : '1px solid rgba(0,0,0,0.12)',
							background: p,
							cursor: 'pointer',
						}}
					/>
				))}

				<button
					aria-label="Open custom color picker"
					title="Custom color"
					onClick={() => setOpen(true)}
					style={{
						minWidth: 28,
						height: 28,
						borderRadius: 6,
						border: '1px solid rgba(0,0,0,0.12)',
						background: 'linear-gradient(45deg,#fff,#e6e6e6)',
						padding: 4,
						cursor: 'pointer',
					}}
				>
					<span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: color }} />
				</button>
			</div>

			{showRecent && recents.length > 0 && (
				<div className="recent-row" style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
					{recents.map((r) => (
						<button
							key={r}
							aria-label={`Recent ${r}`}
							title={r}
							onClick={() => choose(r)}
							style={{
								width: 20,
								height: 20,
								borderRadius: 4,
								border: r.toLowerCase() === color.toLowerCase() ? '2px solid #111' : '1px solid rgba(0,0,0,0.08)',
								background: r,
								cursor: 'pointer',
							}}
						/>
					))}
				</div>
			)}

			{open && (
				<div
					role="dialog"
					aria-label="Color picker dialog"
					style={{
						position: 'absolute',
						zIndex: 9999,
						background: 'white',
						boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
						borderRadius: 8,
						padding: 12,
						marginTop: 8,
					}}
				>
					<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
						<div>
							<HexColorPicker color={color} onChange={(c) => setColor(c)} />
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							<input
								aria-label="Hex color input"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								style={{ width: 120, padding: 6, borderRadius: 6, border: '1px solid rgba(0,0,0,0.12)' }}
							/>
							<div style={{ display: 'flex', gap: 8 }}>
								<button
									onClick={() => {
										choose(color);
										setOpen(false);
									}}
									style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
								>
									Apply
								</button>
								<button
									onClick={() => setOpen(false)}
									style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
