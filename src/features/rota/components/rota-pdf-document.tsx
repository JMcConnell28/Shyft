import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import type { RotaPdfDocumentData } from "@/features/rota/types/rota-pdf"

function RotaPdfDocument({
  data,
}: {
  data: RotaPdfDocumentData
}) {
  return (
    <Document
      author="RocketRota"
      creator="RocketRota"
      title={`${data.locationName} rota - ${data.weekLabel}`}
    >
      {data.pages.map((page) => (
        <Page
          key={page.zoneId}
          orientation="landscape"
          size="A4"
          style={styles.page}
        >
          <View style={styles.header}>
            <View style={styles.brandBlock}>
              {data.brandLogoUrl ? (
                <Image src={data.brandLogoUrl} style={styles.logo} />
              ) : null}
              <View>
                <Text style={styles.brandName}>RocketRota</Text>
                <Text style={styles.brandCaption}>Weekly rota export</Text>
              </View>
            </View>

            <View style={styles.headerMeta}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{data.locationName}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.metaLabel}>Week</Text>
              <Text style={styles.metaValue}>{data.weekLabel}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.metaLabel}>Zone</Text>
              <Text style={styles.metaValue}>{page.zoneName}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.metaLabel}>Exported</Text>
              <Text style={styles.metaValueSmall}>{data.generatedAtLabel}</Text>
            </View>
          </View>

          <StatsRow data={data} page={page} />

          <View style={styles.grid}>
            {page.days.map((day) => (
              <View key={day.id} style={styles.dayColumn}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                  <Text style={styles.dayDate}>{day.dateLabel}</Text>
                </View>

                <View style={styles.dayBody}>
                  {day.shifts.length === 0 ? (
                    <View style={styles.emptyShift}>
                      <Text style={styles.emptyShiftText}>No shifts</Text>
                    </View>
                  ) : (
                    day.shifts.map((shift) => (
                      <View key={shift.id} style={styles.shiftBlock}>
                        <View style={styles.shiftTimeBlock}>
                          {shift.timeLines.map((line) => (
                            <Text key={line} style={styles.shiftTimeText}>
                              {line}
                            </Text>
                          ))}
                        </View>

                        <View style={styles.employeeList}>
                          {shift.employees.length === 0 ? (
                            <Text style={styles.openShiftText}>Open shift</Text>
                          ) : (
                            shift.employees.map((employee) => (
                              <View key={employee.id} style={styles.employeeRow}>
                                <Text
                                  style={[
                                    styles.employeeGroupText,
                                    { color: employee.groupColorHex },
                                  ]}
                                >
                                  {employee.badgeText}
                                </Text>
                                <Text style={styles.employeeName}>
                                  {employee.name}
                                </Text>
                              </View>
                            ))
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={styles.legend}>
              {page.legend.map((item) => (
                <View key={item.id} style={styles.legendItem}>
                  <Text style={[styles.legendGroupText, { color: item.colorHex }]}>
                    {item.badgeText}
                  </Text>
                  <Text style={styles.legendText}>{item.name}</Text>
                </View>
              ))}
            </View>

            {data.note ? (
              <Text style={styles.noteText}>Staff notes: {data.note}</Text>
            ) : (
              <Text style={styles.noteText}>No staff notes for this week.</Text>
            )}
          </View>
        </Page>
      ))}
    </Document>
  )
}

function SummaryPill({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  )
}

function StatsRow({
  data,
  page,
}: {
  data: RotaPdfDocumentData
  page: RotaPdfDocumentData["pages"][number]
}) {
  const visibleStats = data.options.visibleStats
  const statPills = [
    visibleStats.includes("scheduledHours") ? (
      <SummaryPill
        key="scheduledHours"
        label="Scheduled hours"
        value={page.totalHoursLabel}
      />
    ) : null,
    visibleStats.includes("labourCost") ? (
      <SummaryPill key="labourCost" label="Labour cost" value={page.totalCostLabel} />
    ) : null,
    visibleStats.includes("shiftCount") ? (
      <SummaryPill key="shiftCount" label="Shifts" value={`${page.totalShiftCount}`} />
    ) : null,
  ].filter(Boolean)

  if (statPills.length === 0) {
    return null
  }

  return <View style={styles.summaryRow}>{statPills}</View>
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F8FAFF",
    color: "#142B63",
    flexDirection: "column",
    fontSize: 8,
    gap: 8,
    padding: 14,
  },
  header: {
    alignItems: "stretch",
    columnGap: 8,
    flexDirection: "row",
  },
  brandBlock: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    border: "1 solid #DCE7FF",
    borderRadius: 10,
    flex: 1.35,
    flexDirection: "row",
    gap: 8,
    padding: 8,
  },
  logo: {
    height: 22,
    objectFit: "contain",
    width: 22,
  },
  brandName: {
    fontSize: 13,
    fontWeight: 700,
  },
  brandCaption: {
    color: "#6072A8",
    fontSize: 7,
    marginTop: 1,
  },
  headerMeta: {
    backgroundColor: "#FFFFFF",
    border: "1 solid #DCE7FF",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  metaLabel: {
    color: "#6072A8",
    fontSize: 6.5,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 700,
  },
  metaValueSmall: {
    fontSize: 8,
    fontWeight: 700,
  },
  summaryRow: {
    columnGap: 6,
    flexDirection: "row",
  },
  summaryPill: {
    backgroundColor: "#EEF4FF",
    borderRadius: 8,
    flex: 1,
    gap: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  summaryLabel: {
    color: "#6072A8",
    fontSize: 6.5,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 8.5,
    fontWeight: 700,
  },
  grid: {
    columnGap: 4,
    flex: 1,
    flexDirection: "row",
  },
  dayColumn: {
    backgroundColor: "#FFFFFF",
    border: "1 solid #DCE7FF",
    borderRadius: 10,
    flex: 1,
    overflow: "hidden",
  },
  dayHeader: {
    alignItems: "center",
    backgroundColor: "#F4F7FF",
    borderBottom: "1 solid #E3EBFF",
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  dayLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  dayDate: {
    color: "#6072A8",
    fontSize: 6.5,
  },
  dayBody: {
    gap: 2,
    padding: 4,
  },
  emptyShift: {
    alignItems: "center",
    border: "1 dashed #D5DEFA",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  emptyShiftText: {
    color: "#7B8DBA",
    fontSize: 6.5,
  },
  shiftBlock: {
    borderBottom: "1 solid #EDF2FF",
    gap: 2,
    paddingBottom: 3,
    paddingTop: 1,
  },
  shiftTimeBlock: {
    gap: 1,
  },
  shiftTimeText: {
    fontSize: 7,
    fontWeight: 700,
  },
  employeeList: {
    gap: 1.5,
  },
  openShiftText: {
    color: "#6F7FAD",
    fontSize: 6.3,
    fontStyle: "italic",
  },
  employeeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2.5,
  },
  employeeGroupText: {
    fontSize: 6.1,
    fontWeight: 700,
    minWidth: 8,
  },
  employeeName: {
    flex: 1,
    fontSize: 6.2,
  },
  footer: {
    alignItems: "flex-start",
    borderTop: "1 solid #E3EBFF",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    paddingTop: 7,
  },
  legend: {
    columnGap: 6,
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 4,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  legendGroupText: {
    fontSize: 7,
    fontWeight: 700,
    minWidth: 10,
  },
  legendText: {
    fontSize: 6.5,
  },
  noteText: {
    color: "#6072A8",
    flex: 0.9,
    fontSize: 6.5,
    textAlign: "right",
  },
})

export { RotaPdfDocument }
