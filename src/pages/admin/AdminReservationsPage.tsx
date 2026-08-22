import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { useAuth } from '../../AuthContext'
import {
    adminListReservations,
    adminDeleteReservation,
    adminUpdateReservationStatus,
    adminSyncRevolutPayments,
    adminRefundReservation,
    type ReservationDto,
} from '../../adminApi'
import { View, Text, Button, Loader, Badge, Modal, Divider } from 'reshaped'
import { useAdminToast } from '../../hooks/useAdminToast'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

ModuleRegistry.registerModules([AllCommunityModule])

interface GridContext {
    handleStatusChange: (id: string, next: 'waiting' | 'confirmed') => Promise<void>
    updatingId: string | null
}

function StatusCell({ data }: ICellRendererParams<ReservationDto, unknown, GridContext>) {
    if (!data) return null
    const { status } = data

    if (status === 'refunded') {
        return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: '100%' }}>
                <Badge color="neutral" variant="solid">💸 Рефундирана</Badge>
            </div>
        )
    }

    const badgeColor = status === 'confirmed' ? (data.refundOrderId ? 'warning' : 'positive') : 'warning'
    const badgeLabel =
        status === 'confirmed' && data.refundOrderId ? '⏳ Рефунд в процес' :
        status === 'confirmed' ? '✓ Потвърдена' : '⏳ Изчаква'

    return (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Badge color={badgeColor} variant="solid">{badgeLabel}</Badge>
        </div>
    )
}

function IdCell({ data }: ICellRendererParams<ReservationDto>) {
    const [copied, setCopied] = useState(false)
    if (!data) return null
    function copy() {
        void navigator.clipboard.writeText(data!.id).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        })
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: '100%' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{data.id.slice(0, 8).toUpperCase()}</span>
            <button
                onClick={copy}
                title={data.id}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, fontSize: 13, color: copied ? '#22c55e' : '#888' }}
            >
                {copied ? '✓' : '⎘'}
            </button>
        </div>
    )
}

function CopyableIdCell({ value }: ICellRendererParams<ReservationDto, string | null | undefined>) {
    const [copied, setCopied] = useState(false)
    if (!value) return <span style={{ color: '#aaa' }}>—</span>
    function copy() {
        void navigator.clipboard.writeText(value!).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        })
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: '100%' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{value.slice(0, 12)}…</span>
            <button onClick={copy} title={value}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, fontSize: 13, color: copied ? '#22c55e' : '#888' }}>
                {copied ? '✓' : '⎘'}
            </button>
        </div>
    )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <View direction="row" gap={3} align="start">
            <View.Item columns={5}><Text variant="body-2" color="neutral-faded">{label}</Text></View.Item>
            <View.Item columns={7}><Text variant="body-2">{value || '—'}</Text></View.Item>
        </View>
    )
}

type ModalProps = {
    reservation: ReservationDto | null
    onClose: () => void
    refundingId: string | null
    onRefund: (id: string, holderName: string, totalPrice: number | null) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

function StatusBadge({ reservation }: { reservation: ReservationDto }) {
    const { status } = reservation
    if (status === 'refunded') return <Badge color="neutral" variant="solid">💸 Рефундирана</Badge>
    if (status === 'confirmed' && reservation.refundOrderId) return <Badge color="warning" variant="solid">⏳ Рефунд в процес</Badge>
    if (status === 'confirmed') return <Badge color="positive" variant="solid">✓ Потвърдена</Badge>
    return <Badge color="warning" variant="solid">⏳ Изчаква</Badge>
}

function ReservationDetailModal({ reservation, onClose, refundingId, onRefund, onDelete }: ModalProps) {
    const canRefund = reservation?.status === 'confirmed' && !!reservation.paymentOrderId && !reservation.refundOrderId
    const isRefunding = reservation ? refundingId === reservation.id : false

    return (
        <Modal active={!!reservation} onClose={onClose} padding={6} size="600px">
            <View gap={5} attributes={{ style: { maxHeight: '85vh', overflowY: 'auto' } }}>
                <Text variant="title-3" weight="bold">Резервация</Text>
                <Divider />
                {reservation && (
                    <View gap={3}>
                        <Row label="ID" value={<span style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{reservation.id}</span>} />
                        <Row label="Статус" value={<StatusBadge reservation={reservation} />} />
                        <Row label="Екскурзия" value={reservation.excursionName} />
                        <Row label="Дата" value={reservation.excursionDate ?? '—'} />
                        <Row label="Резервирано на" value={reservation.createdAt ? new Date(reservation.createdAt).toLocaleString('bg-BG') : '—'} />
                        <Divider />
                        <Row label="Титуляр" value={reservation.holderName} />
                        <Row label="Имейл" value={reservation.email} />
                        <Row label="Телефон" value={reservation.phone} />
                        <Row label="Туристи" value={String(reservation.touristCount)} />
                        <Row label="Сума" value={reservation.totalPrice != null ? `${reservation.totalPrice} €` : '—'} />
                        <Row label="Забележки" value={reservation.notes} />
                        <Divider />
                        <Row label="Revolut Order ID" value={
                            reservation.paymentOrderId
                                ? <span style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{reservation.paymentOrderId}</span>
                                : '—'
                        } />
                        <Row label="Refund Order ID" value={
                            reservation.refundOrderId
                                ? <span style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{reservation.refundOrderId}</span>
                                : '—'
                        } />
                    </View>
                )}
                <Divider />
                <View direction="row" justify="space-between" align="center">
                    <View direction="row" gap={3}>
                        {canRefund && (
                            <Button
                                variant="outline"
                                color="critical"
                                disabled={isRefunding}
                                onClick={() => reservation && void onRefund(reservation.id, reservation.holderName, reservation.totalPrice)}
                            >
                                {isRefunding ? '…' : '↩ Refund'}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            color="critical"
                            onClick={() => reservation && void onDelete(reservation.id).then(onClose)}
                        >
                            🗑️ Изтрий
                        </Button>
                    </View>
                    <Button variant="outline" color="neutral" onClick={onClose}>Затвори</Button>
                </View>
            </View>
        </Modal>
    )
}


function formatDate(iso: string | null) {
    if (!iso) return ''
    return iso.slice(0, 10)
}

function formatDateTime(iso: string) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('bg-BG') + ' ' + d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
}

const TOGGLEABLE_COLS = [
    { colId: 'col-id',             label: '#' },
    { colId: 'col-createdAt',      label: 'Резервирано на' },
    { colId: 'col-excursionName',  label: 'Екскурзия' },
    { colId: 'col-excursionDate',  label: 'Дата' },
    { colId: 'col-holderName',     label: 'Титуляр' },
    { colId: 'col-phone',          label: 'Телефон' },
    { colId: 'col-email',          label: 'Имейл' },
    { colId: 'col-touristCount',   label: 'Туристи' },
    { colId: 'col-totalPrice',     label: 'Сума €' },
    { colId: 'col-status',         label: 'Статус' },
    { colId: 'col-notes',          label: 'Забележки' },
    { colId: 'col-paymentOrderId', label: 'Revolut Order ID' },
    { colId: 'col-refundOrderId',  label: 'Refund Order ID' },
]

const COL_DEFS: ColDef<ReservationDto>[] = [
    {
        colId: 'col-id',
        headerName: '#',
        field: 'id',
        cellRenderer: IdCell,
        valueFormatter: ({ value }: { value: string }) => value ? value.slice(0, 8).toUpperCase() : '',
        filter: 'agTextColumnFilter',
        width: 120,
        minWidth: 100,
    },
    {
        colId: 'col-createdAt',
        headerName: 'Резервирано на',
        field: 'createdAt',
        valueFormatter: ({ value }: { value: string }) => value ? formatDate(value) : '',
        tooltipValueGetter: ({ value }: { value?: string }) => value ? formatDateTime(value) : '',
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: (filterDate: Date, cellValue: string) => {
                if (!cellValue) return -1
                const d = new Date(cellValue); d.setHours(0, 0, 0, 0)
                if (d < filterDate) return -1
                if (d > filterDate) return 1
                return 0
            },
        },
        width: 120,
        minWidth: 100,
        sort: 'desc',
    },
    {
        colId: 'col-excursionName',
        headerName: 'Екскурзия',
        field: 'excursionName',
        filter: 'agTextColumnFilter',
        flex: 2,
        minWidth: 140,
    },
    {
        colId: 'col-excursionDate',
        headerName: 'Дата',
        field: 'excursionDate',
        valueFormatter: ({ value }: { value: string | null }) => value ? formatDate(value) : '—',
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: (filterDate: Date, cellValue: string | null) => {
                if (!cellValue) return -1
                const [y, m, d] = cellValue.split('-').map(Number)
                const cellDate = new Date(y, m - 1, d)
                if (cellDate < filterDate) return -1
                if (cellDate > filterDate) return 1
                return 0
            },
        },
        width: 110,
        minWidth: 90,
    },
    {
        colId: 'col-holderName',
        headerName: 'Титуляр',
        field: 'holderName',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 120,
    },
    {
        colId: 'col-phone',
        headerName: 'Телефон',
        field: 'phone',
        filter: 'agTextColumnFilter',
        width: 130,
        minWidth: 110,
    },
    {
        colId: 'col-email',
        headerName: 'Имейл',
        field: 'email',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 150,
    },
    {
        colId: 'col-touristCount',
        headerName: 'Туристи',
        field: 'touristCount',
        filter: 'agNumberColumnFilter',
        width: 90,
        minWidth: 80,
    },
    {
        colId: 'col-totalPrice',
        headerName: 'Сума €',
        field: 'totalPrice',
        filter: 'agNumberColumnFilter',
        width: 100,
        minWidth: 90,
        valueFormatter: ({ value }: { value: number | null }) => value != null ? `${value} €` : '—',
    },
    {
        colId: 'col-status',
        headerName: 'Статус',
        field: 'status',
        filter: 'agTextColumnFilter',
        cellRenderer: StatusCell,
        width: 220,
        minWidth: 200,
    },
    {
        colId: 'col-notes',
        headerName: 'Забележки',
        field: 'notes',
        filter: 'agTextColumnFilter',
        flex: 1,
        minWidth: 100,
        valueFormatter: ({ value }: { value: string | null }) => value || '—',
    },
    {
        colId: 'col-paymentOrderId',
        headerName: 'Revolut Order ID',
        field: 'paymentOrderId',
        filter: 'agTextColumnFilter',
        cellRenderer: CopyableIdCell,
        width: 160,
        minWidth: 130,
    },
    {
        colId: 'col-refundOrderId',
        headerName: 'Refund Order ID',
        field: 'refundOrderId',
        filter: 'agTextColumnFilter',
        cellRenderer: CopyableIdCell,
        width: 160,
        minWidth: 130,
        hide: true,
    },
]

export function AdminReservationsPage() {
    const { token } = useAuth()
    const { toastSuccess, toastApiError } = useAdminToast()
    const [rows, setRows] = useState<ReservationDto[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [refundingId, setRefundingId] = useState<string | null>(null)
    const [syncing, setSyncing] = useState(false)
    const [detailRow, setDetailRow] = useState<ReservationDto | null>(null)
    const LS_KEY = 'admin-reservations-hidden-cols'
    const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(LS_KEY)
            return saved ? new Set<string>(JSON.parse(saved) as string[]) : new Set()
        } catch { return new Set() }
    })
    const [colPickerOpen, setColPickerOpen] = useState(false)
    const gridRef = useRef<AgGridReact<ReservationDto>>(null)
    const colPickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!colPickerOpen) return
        function handleClick(e: MouseEvent) {
            if (colPickerRef.current && !colPickerRef.current.contains(e.target as Node)) {
                setColPickerOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [colPickerOpen])

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify([...hiddenCols]))
    }, [hiddenCols])

    function applyHiddenCols(hidden: Set<string>) {
        const api = gridRef.current?.api
        if (!api) return
        for (const { colId } of TOGGLEABLE_COLS) {
            api.setColumnsVisible([colId], !hidden.has(colId))
        }
    }

    function toggleCol(colId: string) {
        const next = new Set(hiddenCols)
        if (next.has(colId)) {
            next.delete(colId)
            gridRef.current?.api.setColumnsVisible([colId], true)
        } else {
            next.add(colId)
            gridRef.current?.api.setColumnsVisible([colId], false)
        }
        setHiddenCols(next)
    }

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListReservations(token, { limit: 2000, offset: 0 })
            .then((d) => { setRows(d.items); setTotal(d.total) })
            .catch((e: unknown) => toastApiError(e, 'Неуспешно зареждане'))
            .finally(() => setLoading(false))
    }, [token, toastApiError])

    useEffect(() => { load() }, [load])

    async function handleStatusChange(id: string, next: 'waiting' | 'confirmed') {
        if (!token) return
        setUpdatingId(id)
        try {
            await adminUpdateReservationStatus(token, id, next)
            setRows(prev => prev.map(r => r.id === id ? { ...r, status: next } : r))
        } catch (e: unknown) {
            toastApiError(e, 'Неуспешна смяна на статус')
        } finally {
            setUpdatingId(null)
        }
    }

    async function handleSyncRevolut() {
        if (!token) return
        setSyncing(true)
        try {
            const result = await adminSyncRevolutPayments(token)
            toastSuccess(`Sync завършен — проверени: ${result.checked}, потвърдени: ${result.confirmed}, грешки: ${result.errors}`)
            if (result.confirmed > 0) load()
        } catch (e: unknown) {
            toastApiError(e, 'Sync неуспешен')
        } finally {
            setSyncing(false)
        }
    }

    async function handleRefund(id: string, holderName: string, totalPrice: number | null) {
        if (!token) return
        const priceStr = totalPrice != null ? ` (${totalPrice} €)` : ''
        if (!confirm(`Рефунд за резервация на ${holderName}${priceStr}?\n\nСумата ще бъде върната по Revolut. Действието не може да се отмени.`)) return
        setRefundingId(id)
        try {
            const result = await adminRefundReservation(token, id)
            toastSuccess('Рефундът е инициализиран — изчаква потвърждение от Revolut.')
            setRows(prev => prev.map(r => r.id === id ? { ...r, refundOrderId: result.refundOrderId } : r))
        } catch (e: unknown) {
            toastApiError(e, 'Рефундът не бе успешен')
        } finally {
            setRefundingId(null)
        }
    }

    function exportToExcel() {
        const api = gridRef.current?.api
        if (!api) return

        const exportRows: Record<string, string | number | null>[] = []
        api.forEachNodeAfterFilterAndSort((node) => {
            const r = node.data as ReservationDto
            if (!r) return
            const statusLabel: Record<string, string> = {
                waiting: 'Изчаква',
                confirmed: 'Потвърдена',
                refunded: 'Рефундирана',
            }
            exportRows.push({
                'ID': r.id,
                'Резервирано на': r.createdAt ? new Date(r.createdAt).toLocaleString('bg-BG') : '',
                'Екскурзия': r.excursionName,
                'Дата на екскурзия': r.excursionDate ?? '',
                'Титуляр': r.holderName,
                'Телефон': r.phone,
                'Имейл': r.email,
                'Туристи': r.touristCount,
                'Сума €': r.totalPrice ?? '',
                'Статус': statusLabel[r.status] ?? r.status,
                'Забележки': r.notes ?? '',
                'Revolut Order ID': r.paymentOrderId ?? '',
                'Refund Order ID': r.refundOrderId ?? '',
            })
        })

        const ws = XLSX.utils.json_to_sheet(exportRows)
        ws['!cols'] = [
            { wch: 38 }, { wch: 18 }, { wch: 30 }, { wch: 14 },
            { wch: 22 }, { wch: 16 }, { wch: 26 }, { wch: 8 },
            { wch: 10 }, { wch: 14 }, { wch: 30 }, { wch: 38 }, { wch: 38 },
        ]
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Резервации')
        const date = new Date().toISOString().slice(0, 10)
        XLSX.writeFile(wb, `rezervacii-${date}.xlsx`)
    }

    async function handleDelete(id: string) {
        if (!token || !confirm('Изтриване на резервацията?')) return
        try {
            await adminDeleteReservation(token, id)
            toastSuccess('Резервацията е изтрита.')
            load()
        } catch (e: unknown) {
            toastApiError(e, 'Изтриването не бе успешно')
        }
    }

    return (
        <View padding={{ s: 4, m: 8 }} gap={5}>
            <View direction="row" justify="space-between" align="center">
                <Text as="h1" variant="title-5" weight="bold">🎟️ Резервации</Text>
                <View direction="row" gap={3} align="center">
                    <Text variant="body-2" color="neutral-faded">Общо: {total}</Text>
                    <Button variant="outline" color="neutral" onClick={exportToExcel}>
                        📥 Експорт Excel
                    </Button>
                    <Button
                        variant="outline"
                        color="primary"
                        disabled={syncing}
                        onClick={() => void handleSyncRevolut()}
                    >
                        {syncing ? '⏳ Синхронизиране…' : '🔄 Sync Revolut'}
                    </Button>
                    <div ref={colPickerRef} style={{ position: 'relative' }}>
                        <Button variant="outline" color="neutral" onClick={() => setColPickerOpen(o => !o)}>
                            ⚙ Колони {hiddenCols.size > 0 && `(${TOGGLEABLE_COLS.length - hiddenCols.size}/${TOGGLEABLE_COLS.length})`}
                        </Button>
                        {colPickerOpen && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 4px)',
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                borderRadius: 8,
                                padding: '6px 0',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                zIndex: 200,
                                minWidth: 200,
                            }}>
                                {TOGGLEABLE_COLS.map(({ colId, label }) => (
                                    <label key={colId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer', userSelect: 'none' }}>
                                        <input
                                            type="checkbox"
                                            checked={!hiddenCols.has(colId)}
                                            onChange={() => toggleCol(colId)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: 14 }}>{label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </View>
            </View>

            {loading ? (
                <View align="center" padding={16}><Loader size="large" /></View>
            ) : rows.length === 0 ? (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-1">🎟️</Text>
                    <Text color="neutral-faded">Няма резервации</Text>
                </View>
            ) : (
                <div className="ag-theme-quartz" style={{ height: 'calc(100vh - 180px)', minHeight: 400 }}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rows}
                        columnDefs={COL_DEFS}
                        onGridReady={() => applyHiddenCols(hiddenCols)}
                        rowHeight={48}
                        context={{ handleStatusChange, updatingId } satisfies GridContext}
                        defaultColDef={{ sortable: true, resizable: true, floatingFilter: true }}
                        pagination
                        paginationPageSize={50}
                        paginationPageSizeSelector={[25, 50, 100, 200]}
                        onRowClicked={(e) => {
                            const target = e.event?.target as HTMLElement | null
                            if (target?.closest('button')) return
                            if (e.data) setDetailRow(e.data)
                        }}
                        rowStyle={{ cursor: 'pointer' }}
                    />
                </div>
            )}

            <ReservationDetailModal
                reservation={detailRow}
                onClose={() => setDetailRow(null)}
                refundingId={refundingId}
                onRefund={handleRefund}
                onDelete={handleDelete}
            />
        </View>
    )
}
